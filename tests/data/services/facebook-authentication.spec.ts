import { LoadFacebookUserApi } from '@/data/contracts/apis/facebook';
import {
    LoadUserAccountRepository,
    CreateFacebookAccountRepository,
    UpdateFacebookAccountRepository,
} from '@/data/contracts/repos';
import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthenticationService } from '@/data/services';
import { mock, MockProxy } from 'jest-mock-extended';

describe('FacebookAuthenticationService', () => {
    let facebookApi: MockProxy<LoadFacebookUserApi>;
    let userAccountRepo: MockProxy<
        LoadUserAccountRepository & CreateFacebookAccountRepository & UpdateFacebookAccountRepository
    >;
    let sut: FacebookAuthenticationService;
    const token = 'any_token';

    beforeEach(() => {
        facebookApi = mock<LoadFacebookUserApi>();
        facebookApi.loadUser.mockResolvedValue({
            name: 'any_fb_name',
            email: 'any_fb_email',
            facebokId: 'any_fb_id',
        });
        userAccountRepo = mock();
        sut = new FacebookAuthenticationService(facebookApi, userAccountRepo);
    });

    it('should call loadFacebookUserApi with correct params', async () => {
        await sut.perform({ token });

        expect(facebookApi.loadUser).toHaveBeenCalledWith({ token });
        expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it('should return AuthenticationError when LoadFacebookUserAPI returns undefined', async () => {
        facebookApi.loadUser.mockResolvedValueOnce(undefined);

        const authResult = await sut.perform({ token });

        expect(authResult).toEqual(new AuthenticationError());
    });

    it('should call LoadUserAccountRepo when LoadFacebookUserApi returns data', async () => {
        await sut.perform({ token });

        expect(userAccountRepo.load).toHaveBeenCalledWith({ email: 'any_fb_email' });
        expect(userAccountRepo.load).toHaveBeenCalledTimes(1);
    });

    it('should call CreateFacebookAccountRepo when LoadUserAccountRepo returns undefined', async () => {
        userAccountRepo.load.mockResolvedValueOnce(undefined);

        await sut.perform({ token });

        expect(userAccountRepo.createFromFacebook).toHaveBeenCalledWith({
            email: 'any_fb_email',
            name: 'any_fb_name',
            facebokId: 'any_fb_id',
        });
        expect(userAccountRepo.createFromFacebook).toHaveBeenCalledTimes(1);
    });

    it('should call UpdateFacebookAccountRepo when LoadUserAccountRepo returns data', async () => {
        userAccountRepo.load.mockResolvedValueOnce({
            id: 'any_id',
            name: 'any_fb_name',
        });

        await sut.perform({ token });

        expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledWith({
            id: 'any_id',
            name: 'any_fb_name',
            facebokId: 'any_fb_id',
        });
        expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledTimes(1);
    });

    it('should update account name', async () => {
        userAccountRepo.load.mockResolvedValueOnce({
            id: 'any_id',
        });

        await sut.perform({ token });

        expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledWith({
            id: 'any_id',
            name: 'any_fb_name',
            facebokId: 'any_fb_id',
        });
        expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledTimes(1);
    });
});
