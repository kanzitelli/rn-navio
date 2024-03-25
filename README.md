# 🧭 Navio

[![React Native Compatible](https://img.shields.io/badge/React%20Native-Compatible-brightgreen)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)
[![Expo Compatible](https://img.shields.io/badge/𝝠%20Expo-Compatible-brightgreen)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)
[![Expo Snack](https://img.shields.io/badge/𝝠%20Expo-Snack-blue)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)

Navio is a navigation library for React Native built on top of [React Navigation](https://github.com/react-navigation/react-navigation). The main goal is to improve DX by building the app layout in one place and using the power of TypeScript to provide autocompletion and other features.

Navio lets you easily create different kinds of apps: bottom tabs-based, simple single-screen, and apps with drawer layouts. It takes care of all boilerplate code configuration for Navigators, Screens, Stacks, Tabs, and Drawers under the hood, so you can focus on developing your app functionality. One of the strong parts of Navio is it helps to separate business logic and UI part of the app with ease.

> If `Navio` helped you in a way, support it with ⭐️

☣️ <i>Navio is still a young library and may have breaking changes in the future.</i>

## Quickstart

### Install dependencies

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

### Create your first Navio layout

This code will build a simple app with one screen.

```tsx
// App.tsx
import {Text} from 'react-native';
import {Navio} from 'rn-navio';

const Home = () => {
  return <Text>Home page</Text>;
};

const navio = Navio.build({
  screens: {Home},
  stacks: {
    HomeStack: ['Home'],
  },
  root: 'stacks.HomeStack',
});

export default () => <navio.App />;
```

<details>
<summary>Tab-based app with 2 tabs</summary>

```tsx
// App.tsx
import {Text} from 'react-native';
import {Navio} from 'rn-navio';

const Home = () => {
  return <Text>Home page</Text>;
};
const Settings = () => {
  return <Text>Settings page</Text>;
};

const navio = Navio.build({
  screens: {Home, Settings},
  stacks: {
    HomeStack: ['Home'],
    SettingsStack: ['Settings'],
  },
  tabs: {
    AppTabs: {
      layout: {
        HomeTab: {stack: 'HomeStack'},
        SettingsTab: {stack: 'SettingsStack'},
      },
    },
  },
  root: 'tabs.AppTabs',
});

export default () => <navio.App />;
```

If you'd like to see more complex and exotic example, please follow [this link](/docs/layout-examples.md).

## Playground

### React Native Starter

You can bootstrap a new project with Navio from [expo-starter](https://github.com/kanzitelli/expo-starter):

```bash
npx cli-rn new app
```

### Expo Snack

Play with the library in the [Expo Snack](https://snack.expo.dev/@kanzitelli/rn-navio-snack).

## Navigation API

Navio provides a colleciton of actions to perform navigation within the app. For API, suppose, you have a `navio` instance:

### Common

- `.N`

  Current navigation object from React Navigation. You can perform any of [these actions](https://reactnavigation.org/docs/navigation-actions).

- `.push(name, params?)`

  Adds a route on top of the stack and navigates forward to it.

- `.goBack()`

  Allows to go back to the previous route in history.

- `.setParams(name, params)`

  Allows to update params for a certain route.

- `.setRoot(as, rootName)`

  Sets a new app root. It can be used to switch between `Stacks`, `Tabs`, and `Drawers`.

### Stacks

Stacks-related actions.

- `.stacks.push(name)`

  Adds a route on top of the stack and navigates forward to it. It can hide tab bar.

- `.stacks.pop(count?)`

  Takes you back to a previous screen in the stack.

- `.stacks.popToTop()`

  Takes you back to the first screen in the stack, dismissing all the others.

- `.stacks.setRoot(name)`

  Sets a new app root from stacks.

### Tabs

Tabs-related actions.

- `.tabs.jumpTo(name)`

  Used to jump to an existing route in the tab navigator.

- `.tabs.updateOptions(name, options)`

  Updates options for a given tab. Used to change badge count.

- `.tabs.setRoot(name)`

  Sets a new app root from tabs.

### Drawers

Drawers-related actions.

- `.drawers.open()`

  Used to open the drawer pane.

- `.drawers.close()`

  Used to close the drawer pane.

- `.drawers.toggle()`

  Used to open the drawer pane if closed, or close if open.

- `.drawers.jumpTo(name)`

  Used to jump to an existing route in the drawer navigator.

- `.drawers.updateOptions(name, options)`

  Updates options for a given drawer menu content. Used to change its title.

- `.drawers.setRoot(name)`

  Sets a new app root from drawers.

### Modals

Modals-related actions.

- `.modals.show(name, params)`

  Used to show an existing modal and pass params.

- `.modals.getParams(name)`

  Returns params passed for modal on .show() method.

### Hooks

Useful hooks.

- `.useN()`
  Duplicate of `useNavigation()` hook from React Navigation. Used for convenience inside screens to get access to navigation object. [Docs](https://reactnavigation.org/docs/use-navigation/).

- `.useR()`
  Duplicate of `useRoute()` hook from React Navigation. Used to convenience inside screens to get access to route object. [Docs](https://reactnavigation.org/docs/use-route)

- `.useParams()`
  Used for quick access to navigation route params. Used to convenience inside screens when passing params.

## Layout structure

Navio requires `screens` and at least one `stacks` to build an app layout. `tabs`, `drawers`, `modals`, `root`, `hooks` and `defaultOptions` are optional and used for more advanced app layouts.

### Screens

These are main bricks of your app with Navio. You can reuse them for any stack you want to build.

A screen can be defined by passing a plain React component. If you'd like to pass some options which describe the screen, then you can pass an object as well.

<details>
<summary>Example</summary>

```tsx
import {Screen1, Screen3} from '@app/screens';

const navio = Navio.build({
  screens: {
    One: Screen1,
    Two: () => {
      return <></>;
    }
    Three: {
      component: Screen3,
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
<summary>Example</summary>

```tsx
const navio = Navio.build({
  // screens are taken from previous step
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
<summary>Example</summary>

```tsx
const navio = Navio.build({
  // screens and stacks are taken from previous step
  tabs: {
    AppTabs: {
      layout: {
        MainTab: {
          stack: ['One', 'Two'],
          // or drawer: 'SomeDrawer',
          options: () => ({
            title: 'Main',
          }),
        },
        ExampleTab: {
          stack: 'ExampleStack',
          // or drawer: 'SomeDrawer',
          options: () => ({
            title: 'Example',
          }),
        },
      },
      options: { ... }, // optional
      navigatorProps: { ... }, // optional
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
<summary>Example</summary>

```tsx
const navio = Navio.build({
  // screens and stacks are taken from previous step
  drawers: {
    MainDrawer: {
      layout: {
        Main: 'MainStack',
        Example: 'ExampleStack',
        Playground: ['One', 'Two', 'Three'],
      },
      options: { ... }, // optional
      navigatorProps: { ... }, // optional
    },
  },
});
```

</details>

### Modals

Modals are built using `Screens` and `Stacks` that have been defined before. You can show/present them at any point of time while using the app.

A modal can be defined by passing an array of `Screens` or a name of `Stacks`.

<details>
<summary>Example</summary>

```tsx
const navio = Navio.build({
  // screens and stacks are taken from previous step
  modals: {
    ExampleModal: {
      stack: 'ExampleStack',
      options: { ... }, // optional
    },
  },
});
```

</details>

### Root

This is a root name of the app. It can be one of `Stacks`, `Tabs` or `Drawers`.

You can change the root of the app later by `navio.setRoot('drawers', 'AppDrawer')` or by changing `initialRouteName` of `<navio.App />` component.

<details>
<summary>Example</summary>

```tsx
const navio = Navio.build({
  // stacks, tabs and drawers are taken from previous examples
  root: 'tabs.AppTabs', // or 'stacks.MainStack', or 'drawers.AppDrawer'
});
```

</details>

### Hooks

List of hooks that will be run on each generated `Stacks`, `Tabs` or `Drawers` navigators. Useful for dark mode or language change.

<details>
<summary>Example</summary>

```tsx
const navio = Navio.build({
  hooks: [useTranslation],
});
```

</details>

### Default options

Default options that will be applied per each `Stacks`'s, `Tabs`'s, `Drawer`'s, or `Modal`'s screens and containers generated within the app.

`Note` All containers and `Tabs`'s and `Drawer`'s screens options have `headerShown: false` by default (in order to hide unnecessary navigation headers). You can always change them which might be useful if you want to have a native `< Back` button when hiding tabs (pushing new `Stack`).

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

### App

Navio generates root component for the app after the layout is defined. It can be used to directly pass it to `registerRootComponent()` or to wrap with extra providers or add more logic before the app's start up.

```tsx
const navio = Navio.build({...});

export default () => <navio.App />
```

You can change the root of the app by `navio.setRoot('drawers', 'AppDrawer')` or by changing `initialRouteName` of `<navio.App />` component.

## FAQs

### Passing params to a modal

This is most frequently asked question ([here](https://github.com/kanzitelli/rn-navio/issues/19), [here](https://github.com/kanzitelli/rn-navio/issues/20) and [here](https://github.com/kanzitelli/rn-navio/issues/28)). Below you can find two solutions:

#### Old approach using React Navigation object

```tsx
// Use .navigate method of React Navigation object and pass params
navio.N.navigate('MyModal', {screen: 'ScreenName', params: {userId: 'someid'}});

// Access params on a screen
const Screen = () => {
  const {userId} = navio.useParams();
};
```

#### New approach with Navio `v0.0.8+`

```tsx
// Use .modals.show method of Navio and pass params
navio.modals.show('MyModal', {userId: 'someid'});

// Access params on a screen
const Screen = () => {
  const {userId} = navio.modals.getParams('MyModal');
};
```

### Navio + React Navigation

Navio can be used among with [React Navigation](https://github.com/react-navigation/react-navigation). All hooks, actions, deep linking, and other stuff from [React Navigation](https://github.com/react-navigation/react-navigation) should work fine with Navio.

If you've found any diffilculties with using Navio and [React Navigation](https://github.com/react-navigation/react-navigation), feel free to open an issue for a discussion.

## Why Navio?

TODO

## Future plans

TODO

### Enhancements

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
