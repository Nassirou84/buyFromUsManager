const SCOPE_GLOBAL = 'global';
const SCOPE_FRONT_END = 'front_end';
const SCOPE_USER = 'user';
const SCOPE_ADMIN = 'admin';

type Scope = typeof SCOPE_GLOBAL | typeof SCOPE_FRONT_END | typeof SCOPE_USER | typeof SCOPE_ADMIN;

export interface Setting {
  id: string;
  name: string;
  value: string | number;
  scope: Scope;
}