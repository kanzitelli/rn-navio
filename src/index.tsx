import {Navio} from './navio';
import {NavioScreen} from './types';

export {Navio};
export type {NavioScreen};

// minor issues
// TODO [ISSUE][TS] When there are more than 2 drawers or 2 tabs, then `.jumpTo()` won't help with autocompletion.
// TODO [ISSUE][TS] `BottomTabNavigatorProps` and `DrawerNavigatorProps` are missing from react-navigation exports. Type `any` is currently used.
// TODO [ISSUE][TS] `navio.setParams` - think about how to take all names and not getting plain string when some name is not defined. It's related to `RootName` issue.
