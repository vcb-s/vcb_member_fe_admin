import { loginInterceptor } from './login';
import { tokenInterceptor } from './token';

export const responseInterceptors = [tokenInterceptor, loginInterceptor];
