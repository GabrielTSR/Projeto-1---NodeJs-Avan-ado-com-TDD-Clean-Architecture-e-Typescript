import { LoadFacebookUserApi } from './../../../src/data/contracts/apis/facebook';
import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthenticationService } from '@/data/services';
import { mock, MockProxy } from 'jest-mock-extended';

type SutTypes = {
    sut: FacebookAuthenticationService;
    loadFacebookUserApi: MockProxy<LoadFacebookUserApi>;
};
const makeSut = (): SutTypes => {
    const loadFacebookUserApi = mock<LoadFacebookUserApi>();
    const sut = new FacebookAuthenticationService(loadFacebookUserApi);
    return {
        sut,
        loadFacebookUserApi,
    };
};

describe('FacebookAuthenticationService', () => {
    it('should call loadFacebookUserApi with correct params', async () => {
        const { sut, loadFacebookUserApi } = makeSut();

        await sut.perform({ token: 'any_token' });

        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({ token: 'any_token' });
        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it('should return AuthenticationError when LoadFacebookUserAPI returns undefined', async () => {
        const { sut, loadFacebookUserApi } = makeSut();
        loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined);

        const authResult = await sut.perform({ token: 'any_token' });

        expect(authResult).toEqual(new AuthenticationError());
    });
});
