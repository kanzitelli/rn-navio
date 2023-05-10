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

## Getting started
Add Navio to your project: 

  1. Build your navigation with ```const navio = Navio.build({...yourBuildHere})``` in ```src/app/navigation/index.tsx``` (you can set any path)
  2. Export your navigation with ```export const NavioApp = navio.App``` or ```export default () => <navio.App />```
  3. (Optional)  Also you may need to export ```export const getNavio = () => navio;``` to use it in components with ```const navio = getNavio()```
  4. Place ```NavioApp``` in your ```App.tsx```  like in example below. If you exported NavioApp as default use ```import  NavioApp  from "./src/app/navigation"``` instead of ```import { NavioApp } from "./src/app/navigation" ``` 
```
import { NavioApp } from "./src/app/navigation"

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <NavioApp />
    </View>
  );
}
```

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
    PlaygroundStack: ['Playground'],
    SettingsStack: ['Settings'],
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
          stack: 'PlaygroundStack',
          options: () => ({
            title: 'Playground',
          }),
        },
        SettingsTab: {
          stack: 'SettingsStack',
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

### Drawer with tabs

Opens app with main drawer and tabs inside one of the drawer content. It can be used to build Twitter like app's layout.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Settings},
  tabs: {
    SomeTabs: {
      content: {
        Home: {
          stack: ['Home'],
        },
        Settings: {
          stack: ['Settings'],
        },
      },
    },
  },
  drawers: {
    MainDrawer: {
      content: {
        Main: {
          stack: ['Home'],
        },
        Tabs: {
          tabs: 'SomeTabs',
        },
      },
    },
  },
  root: 'MainDrawer',
});

export default () => <navio.App />;
```

</details>

### Tabs with drawer

Opens 2 tabs app with a drawer inside one of the tab. It can be used for showing product categories or similar.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, PlaygroundFlashList, PlaygroundExpoImage, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Settings},
  tabs: {
    SomeTabs: {
      content: {
        Home: {
          stack: ['Home'],
        },
        Settings: {
          drawer: 'DrawerForTabs',
        },
      },
    },
  },
  drawers: {
    DrawerForTabs: {
      content: {
        FlashList: {
          stack: ['PlaygroundFlashList'],
          options: {
            title: 'Flash List',
            drawerPosition: 'right',
          },
        },
        ExpoImage: {
          stack: ['PlaygroundExpoImage'],
          options: {
            title: 'Expo Image',
            drawerPosition: 'right',
          },
        },
      },
    },
  },
  root: 'MainDrawer',
});

export default () => <navio.App />;
```

</details>

### Drawer with custom content

Opens app with main drawer with custom content.

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';
import {Home, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Settings},
  drawers: {
    MainDrawer: {
      content: {
        Main: {
          stack: ['Home'],
        },
        Settings: {
          stack: ['Settings'],
        },
      },

      navigatorProps: {
        drawerContent: (props: any) => (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />

            <View style={{height: 1, backgroundColor: 'black'}} />
            <DrawerItem label="Close drawer" onPress={() => navio.drawers.close()} />
          </DrawerContentScrollView>
        ),
      },
    },
  },
  root: 'MainDrawer',
});

export default () => <navio.App />;
```

</details>

Advanced example with all available props can be found at [expo-starter](https://github.com/kanzitelli/expo-starter/blob/master/src/navio.tsx)

## Layout

Navio requires only `screens` prop to build an app layout. `stacks`, `tabs`, `drawers`, `modals`, `root`, `hooks` and `defaultOptions` are optional and used for more advanced app layouts.

### Screens

These are main bricks of your app with Navio. You can reuse them for any stack you want to build.

A screen can be defined by passing a plain React component. If you'd like to pass some options which describe the screen, then you can pass an object as well.

<details>
<summary>Definition</summary>

```tsx
type Screens = Record<string, Screen>;

type Screen =
  | NavioScreen<Props>
  | {
      component: NavioScreen<Props>;
      options?: BaseOptions<NativeStackNavigationOptions>;
    };
```

</details>

<details>
<summary>Example</summary>

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

</details>

### Stacks

Stacks are built using `Screens` that have been defined before. IDEs should help with autocompletion for better DX.

A stack can be defined by passing an array of `Screens`. If you'd like to pass some options down to stack navigator, then you can pass an object.

<details>
<summary>Definition</summary>

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

</details>

<details>
<summary>Example</summary>

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

</details>

### Tabs

Tabs are built using `Screens`, `Stacks`, and `Drawers` that have been defined before.

Tabs can be defined by passing an object with `content` and, optionally, props for navigator.

Content can take as a value one of `Stacks`, `Drawers`, array of `Screens`, or an object that describes stack and options for bottom tab (describing title, icon, etc.).

<details>
<summary>Definition</summary>

```tsx
type Tabs = Record<string, Tab>;

type Tab = {
  content: Record<string, ContentValue>;
  containerOptions?: ContainerOptions;
  navigatorProps?: any;
};

type ContentValue = {
  stack?: StackDefinition;
  drawer?: DrawerDefinition;
  options?: BaseOptions<BottomTabNavigationOptions>;
};
```

</details>

<details>
<summary>Example</summary>

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

</details>

### Drawers

Drawers are built using `Screens`, `Stacks`, and `Tabs` that have been defined before.

Drawers can be defined by passing an object with `content` and, optionally, props for navigator.

Content can take as a value one of `Stacks`, `Tabs`, array of `Screens`, or an object that describes stack and options for bottom tab (describing title, icon, etc.).

<details>
<summary>Definition</summary>

```tsx
type Drawers = Record<string, Drawer>;

type Drawer = {
  content: Record<string, ContentValue>;
  containerOptions?: ContainerOptions;
  navigatorProps?: any;
};

type DrawerContentValue = {
  stack?: StackDefinition;
  tabs?: TabsDefinition;
  options?: BaseOptions<DrawerNavigationOptions>;
};
```

</details>

<details>
<summary>Example</summary>

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

</details>

### Modals

Modals are built using `Screens` and `Stacks` that have been defined before. You can show/present them at any point of time while using the app.

A modal can be defined by passing an array of `Screens` or a name of `Stacks`.

<details>
<summary>Definition</summary>

```tsx
type Modals = Record<string, Modal>;

type Modal = StackDefinition;
```

</details>

<details>
<summary>Example</summary>

```tsx
const navio = Navio.build({
  modals: {
    ExampleModal: 'ExampleStack',
  },
});
```

</details>

### Root

This is a root name of the app. It can be one of `Stacks`, `Tabs` or `Drawers`.

You can change the root of the app later by `navio.setRoot('drawers', 'MainDrawer')` or by changing `initialRouteName` of `<navio.Root />` component.

<details>
<summary>Definition</summary>

```tsx
type RootName = StacksName | TabsName | DrawersName;
```

</details>

<details>
<summary>Example</summary>

```tsx
const navio = Navio.build({
  root: 'AppTabs',
});
```

</details>

### Hooks

List of hooks that will be run on each generated `Stacks`, `Tabs` or `Drawers` navigators. Useful for dark mode or language change.

<details>
<summary>Definition</summary>

```tsx
type Hooks = Function[];
```

</details>

<details>
<summary>Example</summary>

```tsx
const navio = Navio.build({
  hooks: [useAppearance],
});
```

</details>

### Default options

Default options that will be applied per each `Stacks`'s, `Tabs`'s, `Drawer`'s, or `Modal`'s screens and containers generated within the app.

`Note` All containers and `Tabs`'s and `Drawer`'s screens options have `headerShown: false` by default (in order to hide unnecessary navigation headers). You can always change them which might be useful if you want to have a native `< Back` button when hiding tabs (pushing new `Stack`).

<details>
<summary>Definition</summary>

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

</details>

<details>
<summary>Example</summary>

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

</details>

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

#### `.push(name, params?)`

Adds a route on top of the stack and navigates forward to it.

#### `.goBack()`

Allows to go back to the previous route in history.

#### `.setParams(name, params)`

Allows to update params for a certain route.

#### `.setRoot(as, rootName)`

Sets a new app root. It can be used to switch between `Stacks`, `Tabs`, and `Drawers`.

### Stacks

Stacks-related actions.

#### `.stacks.push(name)`

Adds a route on top of the stack and navigates forward to it. It can hide tab bar.

#### `.stacks.pop(count?)`

Takes you back to a previous screen in the stack.

#### `.stacks.popToTop()`

Takes you back to the first screen in the stack, dismissing all the others.

#### `.stacks.setRoot(name)`

Sets a new app root from stacks.

### Tabs

Tabs-related actions.

#### `.tabs.jumpTo(name)`

Can be used to jump to an existing route in the tab navigator.

#### `.tabs.updateOptions(name, options)`

Updates options for a given tab. Can be used to change badge count.

#### `.tabs.setRoot(name)`

Sets a new app root from tabs.

### Drawers

Drawers-related actions.

#### `.drawers.open()`

Can be used to open the drawer pane.

#### `.drawers.close()`

Can be used to close the drawer pane.

#### `.drawers.toggle()`

Can be used to open the drawer pane if closed, or close if open.

#### `.drawers.jumpTo(name)`

Can be used to jump to an existing route in the drawer navigator.

#### `.drawers.updateOptions(name, options)`

Updates options for a given drawer menu content. Can be used to change its title.

#### `.drawers.setRoot(name)`

Sets a new app root from drawers.

### Modals

Modals-related actions.

#### `.modals.show()`

Can be used to show an existing modal.

## TypeScript

Navio is developed in TypeScript from the beginning. TypeScript helps with autocompletion and to achieve better DX. There are still some issues (could be found at `index.tsx`). So if you are a TypeScript expert, please open an issue for help.

#### Autocompletion

In order to use full power of TS autocompletion, you'll need to define all layout components (could be just empty object). I don't know how to fix that at the moment.

```tsx
const navio = Navio.build({
  screens: {Home, Settings},
  stacks: {MainStack: ['Main', 'Settings']},
  root: '...', // 🚫 won't help w/ autocompletion
});

const navio = Navio.build({
  screens: {Home, Settings},
  stacks: {MainStack: ['Main', 'Settings']},
  drawers: {},
  tabs: {},
  root: '...', // ✅ will help w/ autocompletion
});
```

## Navio + React Navigation

Navio can be used among with [React Navigation](https://github.com/react-navigation/react-navigation). All hooks, actions, deep linking, and other stuff from [React Navigation](https://github.com/react-navigation/react-navigation) should work fine with Navio.

If you've found any diffilculties with using Navio and [React Navigation](https://github.com/react-navigation/react-navigation), feel free to open an issue for a discussion.

## Enhancements

There are still some things I would like to add to the library:

- [x] `.updateOptions()` for specific tab and drawer.
- [x] Tabs can be placed inside Drawer and vice versa.
- [ ] Make deeplinking easier by providing `linking` prop to screens.
- [ ] Improve docs. Deeplinking section, etc. Based on this [issue](https://github.com/kanzitelli/expo-starter/issues/29).
- [ ] Make Navio universal by adding [RNN](https://github.com/wix/react-native-navigation) and [rnn-screens](https://github.com/kanzitelli/rnn-screens).
- [ ] Extend Navio funtionality and app layout.
- [ ] Easy integration of Navio with React Navigation (eg. navio.Stack())
- [ ] TypeScript issues @ `index.tsx` file.

Feel free to open an issue for any suggestions.

## License

This project is [MIT licensed](/LICENSE.md)
