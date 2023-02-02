import {Navio} from './navio';
import {NavioScreen} from './types';

export {Navio};
export type {NavioScreen};

// 0.0.2 todos
// [ ] test on more use cases
// [ ] make better Navio section in the app
// [ ] prepare docs

// minor issues
// TODO [ISSUE][TS] When there are more than 2 drawers or 2 tabs, then `.jumpTo()` won't help with autocompletion.
// TODO [ISSUE][TS] `BottomTabNavigatorProps` and `DrawerNavigatorProps` are missing from react-navigation exports. Type `any` is currently used.
// TODO [ISSUE][TS] `RootName` is `string` when one of [stacks, tabs, drawers] is not defined. Fix: just initialise them as empty object {stacks: {}, tabs: {}, drawers: {}}
// TODO [ISSUE][TS] `navio.setParams` - think about how to take all names and not getting plain string when some name is not defined. It's related to `RootName` issue.

// testing
// const navio = Navio.build({
//   screens: {
//     Main: {
//       component: () => {
//         return null;
//       },
//     },
//   },
//   stacks: {
//     MainStack: ['Main'],
//   },
//   tabs: {
//     MainTabs: {
//       content: {
//         One: 'MainStack',
//         Two: 'MainStack',
//       },
//     },
//   },
//   drawers: {
//     MainDrawer: {
//       content: {
//         One: 'MainStack',
//         Two: ['Main'],
//       },
//     },
//   },
//   root: 'MainDrawer',
// });
// navio.setRoot('stacks', 'MainStack');
// navio.Root({'initialRouteName':''})
// navio.drawers.setRoot('')
