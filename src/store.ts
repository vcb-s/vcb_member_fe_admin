// @ts-ignore - no type declarations
import { create } from 'dva-core';
// @ts-ignore - no type declarations
import createLoading from 'dva-loading';

// Global models
import appModel from '@/models/app';
import usersModel from '@/models/users';
import personModel from '@/models/person';

// Page-level models
import loginModel from '@/pages/login/model';
import personCardEditModel from '@/pages/person/uid/card/edit/models/index';

const app = create({});
// @ts-ignore - Plugin typings mismatch
app.use(createLoading());

app.model(appModel);
app.model(usersModel);
app.model(personModel);
app.model(loginModel);
app.model(personCardEditModel);

app.start();

// @ts-ignore - _store is populated after start()
export const store: ReturnType<typeof import('redux').createStore> = app._store;
