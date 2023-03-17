# 🧭 Navio

[![Expo Snack](https://img.shields.io/badge/𝝠%20Expo-Snack-blue)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)
[![Expo Compatible](https://img.shields.io/badge/𝝠%20Expo-Compatible-brightgreen)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)

Navio is a navigation library for React Native (compatible with Expo) built on top of [React Navigation](https://github.com/react-navigation/react-navigation). The main goal is to improve DX by building the app layout in one place and using the power of TypeScript to provide route names autocompletion and other features.

Navio lets you easily create different kinds of apps: bottom tabs-based, simple single-screen, and apps with drawer layouts. It takes care of all boilerplate code configuration for Navigators, Screens, Stacks, Tabs, and Drawers under the hood, so you can focus on developing your app functionality.

> If `Navio` helped you in any way, don't hesitate to ⭐️ the repo!

☣️ <i>Navio is still a young library and may have breaking changes in the future.</i>

## Quickstart

```bash
yarn add rn-navio
```

<details>
<summary>React Navigation dependencies</summary>

As Navio is built on top of [React Navigation](https://github.com/react-navigation/react-navigation), you will need to have the following libraries installed:

```bash
yarn add @react-navigation/stack @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/drawer
```

For more information, please check the [installation steps](https://reactnavigation.org/docs/getting-started/#installation).

</details>

## Playground

### Expo Starter

You can bootstrap a new project with Navio (from [expo-starter](https://github.com/kanzitelli/expo-starter)):

```bash
npx cli-rn new app
```

### Expo Snack

Play with the library in the [Expo Snack](https://snack.expo.dev/@kanzitelli/rn-navio-snack).

## Examples

### 2 screens

Simple app with 2 screens.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Settings},
  stacks: {
    Main: ['Home', 'Settings'],
  },
  root: 'Main',
});

export default () => <navio.App />;
```

</details>

### Tabs

Tab-based app with 3 tabs.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, Example, Playground, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Example, Playground, Settings},
  stacks: {
    HomeStack: ['Home', 'Example'],
  },
  tabs: {
    AppTabs: {
      content: {
        HomeTab: {
          stack: 'HomeStack',
          options: () => ({
            title: 'Home',
          }),
        },
        PlaygroundTab: {
          stack: ['Playground'],
          options: () => ({
            title: 'Playground',
          }),
        },
        SettingsTab: {
          stack: ['Settings'],
          options: () => ({
            title: 'Settings',
          }),
        },
      },
    },
  },
  root: 'AppTabs',
});

export default () => <navio.App />;
```

</details>

### Drawer

Simple app with drawer and 3 stacks.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, Example, Playground, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Example, Playground, Settings},
  stacks: {
    HomeStack: ['Home', 'Example'],
  },
  drawers: {
    AppDrawer: {
      content: {
        Main: 'HomeStack',
        Playground: ['Playground'],
        Settings: ['Settings'],
      },
    },
  },
  root: 'AppDrawer',
});

export default () => <navio.App />;
```

</details>

### Auth flow

There are two ways of handling `Auth` flow with Navio: Static and Dynamic.

<details>
<summary>Static - Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Main, SignIn, SignUp} from '@app/screens';

const navio = Navio.build({
  screens: {Main, SignIn, SignUp},
  stacks: {
    MainApp: ['Main'],
    Auth: ['SignIn', 'SignUp'],
  },
  root: 'MainApp',
});

// Let's say you show `MainApp` in the beginning with limited functionality
// and have some screen with "Sign in" button. After pressing "Sign in",
// you can show `Auth` flow.
const Screen = () => {
  const {navio} = useServices();

  const onSignInPressed = () => {
    navio.setRoot('stacks', 'Auth');
  };

  return <>{Content}</>;
};

// After `Auth` flow is successfully finished, you can show `MainApp`.
navio.setRoot('stacks', 'MainApp');

export default () => <navio.App />;
```

</details>

<details>
<summary>Dynamic - Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Main, SignIn, SignUp} from '@app/screens';

const navio = Navio.build({
  screens: {Main, SignIn, SignUp},
  stacks: {
    MainApp: ['Main'],
    Auth: ['SignIn', 'SignUp'],
  },
  root: 'MainApp',
});

// Let's say you want to react on changes from auth provider (stores, hook, etc.)
// and show root app depending on that value.
export default (): JSX.Element => {
  const {authData} = useAuth();
  const isLoggedIn = !!authData;

  return (
    <SomeProviders>
      <navio.App initialRouteName={isLoggedIn ? 'MainApp' : 'Auth'} />
    </SomeProviders>
  );
};
```

</details>

### Hide tabs

Hide tabs on a specific screen.

As React Navigation suggests in the [docs](https://reactnavigation.org/docs/hiding-tabbar-in-screens/), we need to define a stack that we want to "push over" tabs.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, Product, Playground, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {
    Home,
    Settings,

    ProductPage: {
      component: Product,
      options: {
        headerShown: false,
      },
    },
  },
  stacks: {
    ProductPageStack: {
      screens: ['ProductPage'],
      containerOptions: {
        headerShown: true,
        title: 'Product page',
      },
    },
  },
  tabs: {
    AppTabs: {
      content: {
        Home: ['Home'],
        Settings: ['Settings'],
      },
    },
  },
  root: 'AppTabs',
});

// Now you can push `ProductPageStack` from tabs and it will be without tabs.
navio.stacks.push('ProductPageStack');
```

</details>

Advanced example with all available props can be found @ [expo-starter](https://github.com/kanzitelli/expo-starter/blob/master/src/navio.tsx)

## Layout

Navio requires only `screens` prop to build an app layout. `stacks`, `tabs`, `drawers`, `modals`, `root`, `hooks` and `defaultOptions` are optional and used for more advanced app layouts.

### Screens

These are main bricks of your app with Navio. You can reuse them for any stack you want to build.

#### Definition

A screen can be defined by passing a plain React component. If you'd like to pass some options which describe the screen, then you can pass an object as well.

```tsx
type Screens = Record<string, Screen>;

type Screen =
  | NavioScreen<Props>
  | {
      component: NavioScreen<Props>;
      options?: BaseOptions<NativeStackNavigationOptions>;
    };
```

#### Example

```tsx
import {ScreenOne} from './screens/one.tsx';

const navio = Navio.build({
  screens: {
    One: ScreenOne,
    Two: () => {
      return <></>;
    }
    Three: {
      component: ScreenOne,
      options: (props) => ({
        title: 'ThreeOne'
      })
    }
  },
});
```

### Stacks

Stacks are built using `Screens` that have been defined before. IDEs should help with autocompletion for better DX.

#### Definition

A stack can be defined by passing an array of `Screens`. If you'd like to pass some options down to stack navigator, then you can pass an object.

```tsx
type Stacks = Record<string, Stack>;

type Stack =
  | ScreenName[]
  | {
      screens: ScreenName[];
      containerOptions?: ContainerOptions;
      navigatorProps?: NativeStackNavigatorProps;
    };
```

#### Example

```tsx
const navio = Navio.build({
  stacks: {
    MainStack: ['One', 'Two'],
    ExampleStack: {
      screens: ['Three'],
      navigatorProps: {
        screenListeners: {
          focus: () => {},
        },
      },
    },
  },
});
```

### Tabs

Tabs are built using `Screens` and `Stacks` that have been defined before.

#### Definition

Tabs can be defined by passing an object with `content` and, optionally, props for navigator.

Content can take as a value one of `Stacks`, array of `Screens`, or an object that describes stack and options for bottom tab (describing title, icon, etc.).

```tsx
type Tabs = Record<string, Tab>;

type Tab = {
  content: Record<string, ContentValue>;
  containerOptions?: ContainerOptions;
  navigatorProps?: any;
};

type ContentValue = {
  stack: StackDefinition;
  options?: BaseOptions<BottomTabNavigationOptions>;
};
```

#### Example

```tsx
const navio = Navio.build({
  tabs: {
    AppTabs: {
      content: {
        MainTab: {
          stack: ['One', 'Two'],
          options: () => ({
            title: 'Main',
          }),
        },
        ExampleTab: {
          stack: 'ExampleStack',
          options: () => ({
            title: 'Example',
          }),
        },
      },
    },
  },
});
```

### Drawers

Drawers are built using `Screens` and `Stacks` that have been defined before.

#### Definition

Drawers can be defined by passing an object with `content` and, optionally, props for navigator.

Content can take as a value one of `Stacks`, array of `Screens`, or an object that describes stack and options for bottom tab (describing title, icon, etc.).

```tsx
type Drawers = Record<string, Drawer>;

type Drawer = {
  content: Record<string, ContentValue>;
  containerOptions?: ContainerOptions;
  navigatorProps?: any;
};

type DrawerContentValue = {
  stack: StackDefinition;
  options?: BaseOptions<DrawerNavigationOptions>;
};
```

#### Example

```tsx
const navio = Navio.build({
  drawers: {
    MainDrawer: {
      content: {
        Main: 'MainStack',
        Example: 'ExampleStack',
        Playground: ['One', 'Two', 'Three'],
      },
    },
  },
});
```

### Modals

Modals are built using `Screens` and `Stacks` that have been defined before. You can show/present them at any point of time while using the app.

#### Definition

A modal can be defined by passing an array of `Screens` or a name of `Stacks`.

```tsx
type Modals = Record<string, Modal>;

type Modal = StackDefinition;
```

#### Example

```tsx
const navio = Navio.build({
  modals: {
    ExampleModal: 'ExampleStack',
  },
});
```

### Root

This is a root name of the app. It can be one of `Stacks`, `Tabs` or `Drawers`.

You can change the root of the app later by `navio.setRoot('drawers', 'MainDrawer')` or by changing `initialRouteName` of `<navio.Root />` component.

#### Definition

```tsx
type RootName = StacksName | TabsName | DrawersName;
```

#### Example

```tsx
const navio = Navio.build({
  root: 'AppTabs',
});
```

### Hooks

List of hooks that will be run on each generated `Stacks`, `Tabs` or `Drawers` navigators. Useful for dark mode or language change.

#### Definition

```tsx
type Hooks = Function[];
```

#### Example

```tsx
const navio = Navio.build({
  hooks: [useAppearance],
});
```

### Default options

Default options that will be applied per each `Stacks`'s, `Tabs`'s, `Drawer`'s, or `Modal`'s screens and containers generated within the app.

`Note` All containers and `Tabs`'s and `Drawer`'s screens options have `headerShown: false` by default (in order to hide unnecessary navigation headers). You can always change them which might be useful if you want to have a native `< Back` button when hiding tabs (pushing new `Stack`).

#### Definition

```tsx
type DefaultOptions = {
  stacks?: {
    screen?: StackScreenOptions;
    container?: ContainerOptions;
  };
  tabs?: {
    screen?: TabScreenOptions;
    container?: ContainerOptions;
  };
  drawers?: {
    screen?: DrawerScreenOptions;
    container?: ContainerOptions;
  };
  modals?: {
    container?: ContainerOptions;
  };
};
```

#### Example

```tsx
const navio = Navio.build({
  defaultOptions: {
    stacks: {
      screen: {
        headerShadowVisible: false,
        headerTintColor: Colors.primary,
      },
      container: {
        headerShown: true,
      },
    },
    tabs: {
      screen: tabDefaultOptions,
    },
    drawer: {
      screen: drawerDefaultOptions,
    },
  },
});
```

## App

Navio generates root component for the app after the layout is defined. It can be used to directly pass it to `registerRootComponent()` or to wrap with extra providers or add more logic before the app's start up.

```tsx
const navio = Navio.build({...});

export default () => <navio.App />
```

You can change the root of the app by `navio.setRoot('drawers', 'MainDrawer')` or by changing `initialRouteName` of `<navio.App />` component.

## Navigation

Navio provides a colleciton of actions to perform navigation within the app.

### Common

#### `navio.N`

Current navigation instance (from React Navigation). You can perform any of [these actions](https://reactnavigation.org/docs/navigation-actions).

#### `navio.push(name, params?)`

Adds a route on top of the stack and navigates forward to it.

#### `navio.goBack()`

Allows to go back to the previous route in history.

#### `navio.setParams(name, params)`

Allows to update params for a certain route.

#### `navio.setRoot(as, rootName)`

Sets a new app root. It can be used to switch between `Stacks`, `Tabs`, and `Drawers`.

### Stacks

Stacks-related actions.

#### `navio.stacks.push(name)`

Adds a route on top of the stack and navigates forward to it. It can hide tab bar.

#### `navio.stacks.pop(count?)`

Takes you back to a previous screen in the stack.

#### `navio.stacks.popToTop()`

Takes you back to the first screen in the stack, dismissing all the others.

#### `navio.stacks.setRoot(name)`

Sets a new app root from stacks.

### Tabs

Tabs-related actions.

#### `navio.tabs.jumpTo(name)`

Can be used to jump to an existing route in the tab navigator.

#### `navio.tabs.updateOptions(name, options)`

Updates options for a given tab. Can be used to change badge count.

#### `navio.tabs.setRoot(name)`

Sets a new app root from tabs.

### Drawers

Drawers-related actions.

#### `navio.drawers.open()`

Can be used to open the drawer pane.

#### `navio.drawers.close()`

Can be used to close the drawer pane.

#### `navio.drawers.toggle()`

Can be used to open the drawer pane if closed, or close if open.

#### `navio.drawers.jumpTo(name)`

Can be used to jump to an existing route in the drawer navigator.

#### `navio.drawers.setRoot(name)`

Sets a new app root from drawers.

### Modals

Modals-related actions.

#### `navio.modals.show()`

Can be used to show an existing modal.

## TypeScript

Navio is developed in TypeScript from the beginning. TypeScript helps with autocompletion and to achieve better DX. There are still some cases where I don't know the best way of doing it in TypeScript. So if you are a TypeScript expert, please open an issue for help.

## Navio + React Navigation

Navio can be used among with [React Navigation](https://github.com/react-navigation/react-navigation). All hooks, actions, deep linking, and other stuff from [React Navigation](https://github.com/react-navigation/react-navigation) should work fine with Navio.

If you've found any diffilculties with using Navio and [React Navigation](https://github.com/react-navigation/react-navigation), feel free to open an issue for a discussion.

## Enhancements

There are still some things I would like to add to the library:

- [x] `.updateOptions()` for specific tab.
- [ ] Improve docs. Deeplinking section, etc. Based on this [issue](https://github.com/kanzitelli/expo-starter/issues/29).
- [ ] Make Navio universal by adding [RNN](https://github.com/wix/react-native-navigation) and [rnn-screens](https://github.com/kanzitelli/rnn-screens).
- [ ] Make deeplinking easier by providing `linking` prop to screens.
- [ ] Extend Navio funtionality and app layout.
- [ ] Easy integration of Navio with React Navigation (eg. navio.Stack())
- [ ] TypeScript issues @ `index.tsx` file.

Feel free to open an issue for any suggestions.

## License

This project is [MIT licensed](/LICENSE.md)
