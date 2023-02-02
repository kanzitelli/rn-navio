import React, {PropsWithChildren} from 'react';
import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NavigationContainer, ParamListBase, RouteProp} from '@react-navigation/native';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import {NativeStackNavigatorProps} from '@react-navigation/native-stack/lib/typescript/src/types';

export type Keys<T> = keyof T;
export type ContentKeys<T extends {content: any}> = Keys<T['content']>;

export type BaseOptions<Return = NativeStackNavigationOptions> =
  | Return
  | ((props?: {route?: RouteProp<ParamListBase, string>; navigation?: any}) => Return);
export type TStackDefinition<ScreenName, StackName> =
  | StackName
  | ScreenName[]
  | TStackDataObj<ScreenName>;
export type TDrawerDefinition<DrawerName> = DrawerName; // maybe smth else will be added
export type TTabsDefinition<TabsName> = TabsName; // maybe smth else will be added
export type TScreenData<Props = {}> =
  | NavioScreen<Props>
  | {
      component: NavioScreen<Props>;
      options?: BaseOptions<NativeStackNavigationOptions>;
    };
export type TStackDataObj<ScreenName> = {
  screens: ScreenName[];
  navigatorProps?: NativeStackNavigatorProps;
};
export type TStackData<ScreenName> = ScreenName[] | TStackDataObj<ScreenName>;
export type TTabsData<ScreenName, StackName> = {
  content: Record<string, TStackDefinition<ScreenName, StackName>>;
  options?: BaseOptions<BottomTabNavigationOptions>;
  navigatorProps?: any; // TODO BottomTabNavigatorProps doesn't exist :(
};
export type TModalData<ScreenName, StackName> = TStackDefinition<ScreenName, StackName>;
export type TDrawerData<ScreenName, StackName> = {
  content: Record<string, TStackDefinition<ScreenName, StackName>>;
  options?: BaseOptions<DrawerNavigationOptions>;
  navigatorProps?: any; // TODO DrawerNavigatorProps doesn't exist :(
};
export type TRootName<StackName, TabsName, DrawerName> = TabsName | StackName | DrawerName;
export type ExtractProps<Type> = Type extends React.FC<infer X> ? X : never;

export type Layout<
  Screens = any,
  Stacks = any,
  Tabs = any,
  Modals = any,
  Drawers = any,
  RootName = any,
> = {
  /**
   * `(required)`
   * Screens of the app. Navigate to by using `navio.push('...')` method.
   */
  screens: Screens;

  /**
   * `(optional)`
   * Stacks of the app. Navigate to by using `navio.pushStack('...Stack')` method. Good to use if you want to hide tabs on the specific screens.
   */
  stacks?: Stacks;

  /**
   * `(optional)`
   * Tabs app. Navigate to by using `navio.jumpTo('...Tab')` method.
   */
  tabs?: Tabs;

  /**
   * `(optional)`
   * Modals of the app. Navigate to by using `navio.show('...Modal')` method.
   */
  modals?: Modals;

  /**
   * `(optional)`
   * Drawers of the app. Navigate to by using `navio.drawer.open('...Drawer')` method.
   */
  drawers?: Drawers;

  /**
   * `(optional)`
   * Root name to start the app with. Possible values `'Tabs' | any of stack`.
   */
  root?: RootName;

  /**
   * `(optional)`
   * List of hooks that will be run on each generated stack or tab navigators. Useful for dark mode or language change.
   */
  hooks?: Function[];

  /**
   * `(optional)`
   * Default options to be applied per each stack's, tab's or drawer's screens generated within the app.
   */
  defaultOptions?: DefaultOptions;
};
export type DefaultOptions = {
  stack?: BaseOptions<NativeStackNavigationOptions>;
  tab?: BaseOptions<BottomTabNavigationOptions>;
  drawer?: BaseOptions<DrawerNavigationOptions>;
};
export type NavioScreen<Props = {}> = React.FC<PropsWithChildren<Props>> & {
  options?: BaseOptions<NativeStackNavigationOptions>;
};

// Layouts
export type RootProps<RootName extends string> = {
  navigationContainerProps?: Omit<ExtractProps<typeof NavigationContainer>, 'children'>;
  initialRouteName?: RootName; // TODO must be observable
};
