# 🧭 Navio

☣️ <i>This is an experimental library and may have breaking changes in the future.</i>

[![Expo Snack](https://img.shields.io/badge/𝝠%20Expo-Snack-blue)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)
[![Expo Compatible](https://img.shields.io/badge/𝝠%20Expo-Compatible-brightgreen)](https://snack.expo.dev/@kanzitelli/rn-navio-snack)

Navio is a tiny library (wrapper) built on top of [React Navigation](https://github.com/react-navigation/react-navigation) that makes it easy to build an app's layout (navigation structure) in one place and use benefits of types predictability across the app. Predictability of route names while building app's layout and using navigation methods (e.g. push, jumpTo) leads to better DX, less mistakes and faster development process. And yes, no more messing with `<NavigationContainer>`, `<Tabs.Navigator>`s and `<Stack.Screen>`s!

## Quickstart

```bash
yarn add rn-navio
```

<details>
<summary>React Navigation dependencies</summary>

As Navio is built on top of [React Navigation](https://github.com/react-navigation/react-navigation), you will need to have the following libraries installed:

```bash
yarn add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

For more information, please check the [installation steps](https://reactnavigation.org/docs/getting-started/#installation).

</details>

## Playground

You can play with the library in the [Expo Snack](https://snack.expo.dev/@kanzitelli/rn-navio-snack).

## Examples

- 2 screens

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';

const navio = Navio.build({
  screens: {
    Home: () => (
      <>
        <Text>Home</Text>
        <Button title="Push" onPress={() => navio.push('Example')} />
      </>
    ),
    Example: () => (
      <>
        <Text>Example</Text>
        <Button title="Go back" onPress={() => navio.goBack()} />
      </>
    ),
  },
});

export default () => <navio.Root />;
```

</details>

- Tabs

<details>
<summary>Show code</summary>

```tsx
import {Navio} from 'rn-navio';

const navioTabs = Navio.build({
  screens: {
    Home: () => (
      <>
        <Text>Home</Text>
        <Button title="Push" onPress={() => navio.push('Example')} />
        <Button title="Push stack" onPress={() => navio.pushStack('HomeStack')} />
        <Button title="Set Root - Stack" onPress={() => navio.setRoot('HomeStack')} />
        <Button title="Set Root - Tabs" onPress={() => navio.setRoot('Tabs')} />
      </>
    ),
    Example: () => (
      <>
        <Text>Example</Text>
        <Button title="Go back" onPress={() => navio.goBack()} />
      </>
    ),
    Settings: {
      component: () => (
        <>
          <Text>Settings</Text>
          <Button title="Jump to tab" onPress={() => navio.jumpTo('HomeTab')} />
        </>
      ),
      options: () => ({
        headerTitleStyle: {color: 'red'},
      }),
    },
  },
  stacks: {
    HomeStack: ['Home', 'Example'],
  },
  tabs: {
    HomeTab: {
      stack: 'HomeStack',
      options: () => ({
        title: 'Home',
      }),
    },
    SettingsTab: {
      stack: ['Settings'],
      options: {
        title: 'Settings',
      },
    },
  },
  options: {
    tab: {
      // default tab's options
      headerShown: false,
    },
  },
});

export default () => <navio.Root />;
```

</details>

- Advanced example with all available props can be found @ [kanzitelli/expo-starter](https://github.com/kanzitelli/expo-starter/blob/navio/src/screens/index.tsx)

## Usage

### Layout

Navio's layout contains of one required field `screens` and optional fields such as `stacks`, `tabs`, `modals`, `root`, `hooks` and `options`. Stacks are built with `screens`' names. Tabs and modals are built with `stacks`' and `screens` names.

```tsx
type Layout<Screens, Stacks, Tabs, Modals, RootName> = {
  /**
   * Screens of the app. Navigate to by using `navio.push('...')` method.
   */
  screens: Screens;

  /**
   * Stacks of the app. Navigate to by using `navio.pushStack('...Stack')` method. Good to use if you want to hide tabs on the specific screens.
   */
  stacks?: Stacks;

  /**
   * Tabs of the app. Navigate to by using `navio.jumpTo('...Tab')` method.
   */
  tabs?: Tabs;

  /**
   * Modals of the app. Navigate to by using `navio.show('...Modal')` method.
   */
  modals?: Modals;

  /**
   * Root name to start the app with. Possible values `'Tabs' | any of stack`.
   */
  root?: RootName;

  /**
   * List of hooks that will be run on each generated stack or tab navigators. Useful for dark mode or language change.
   */
  hooks?: Function[];

  /**
   * Default options to be applied per each stack's screens or tab generated within the app layout.
   */
  options?: {
    stack?: BaseOptions<NativeStackNavigationOptions>;
    tab?: BaseOptions<BottomTabNavigationOptions>;
  };
};
```

### Root component

Navio generates root component for the app after the layout is built. It can be used to directly pass it to `registerRootComponent()` or to wrap with extra providers or add more logic before the app's start up.

```tsx
const navio = Navio.build({...});

export default () => <navio.Root />
```

### Navigation

Once the app's layout is built, Navio instance can be used to perform navigation actions in the screens. All available methods are listed below:

```tsx
interface Actions = {
  /**
   * `push(...)` is used to navigate to a new screen in the stack.
   */
  push(name: ScreenName, props?: Props): void;

  /**
   * `pushStack(...)` is used to navigate to a new stack. It will "hide" tabs.
   */
  pushStack(name: StackName): void;

  /**
   * `goBack()` is used to navigate back in the stack.
   */
  goBack(): void;

  /**
   * `pop(...)` is used to navigate to a previous screen in the stack.
   */
  pop(count?: number): void;

  /**
   * `popToPop()` is used to navigate to the first screen in the stack, dismissing all others.
   */
  popToTop(): void;

  /**
   * `show(...)` is used to show a modal.
   */
  show(name: ModalName): void;

  /**
   * `jumpTo(...)` is used to change the current tab.
   */
  jumpTo(name: TabName): void;

  /**
   * `setRoot(...)` is used to set a new root of the app. It can be used to switch Auth and App stacks.
   */
  setRoot(name: 'Tabs' | StackName): void;
};
```

## Enhancements

There are still some things I would like to add to the library:

- [ ] Test on more use cases.
- [ ] Make it universal by adding [RNN](https://github.com/wix/react-native-navigation) (similar to [rnn-screens](https://github.com/kanzitelli/rnn-screens)).
- [ ] Pass props to stack and tabs navigators.
- [ ] Types for props.

Feel free to open an issue for any suggestions.

## License

This project is [MIT licensed](/LICENSE.md)
