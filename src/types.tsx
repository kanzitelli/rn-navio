import React, {PropsWithChildren} from 'react';
import {BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {NavigationContainer, ParamListBase, RouteProp} from '@react-navigation/native';
import {DrawerNavigationOptions} from '@react-navigation/drawer';
import {NativeStackNavigatorProps} from '@react-navigation/native-stack/lib/typescript/src/types';

// Container is anything from Stack, Tabs, Drawer, Modal

export type Keys<T> = keyof T;
export type ContainerLayoutKeys<T extends {layout: any}> = Keys<T['layout']>;

export type RootSetAs = keyof Pick<Layout, 'stacks' | 'tabs' | 'drawers'>;

// Options
export type BaseOptionsProps =
  | {route?: RouteProp<ParamListBase, string>; navigation?: any}
  | undefined;
export type BaseOptions<Return = NativeStackNavigationOptions> =
  | Return
  | ((props?: BaseOptionsProps) => Return);
type ScreenOptions = BaseOptions<NativeStackNavigationOptions>;
export type StackScreenOptions = ScreenOptions;
export type ModalScreenOptions = StackScreenOptions;
export type TabScreenOptions = BaseOptions<BottomTabNavigationOptions>;
export type DrawerScreenOptions = BaseOptions<DrawerNavigationOptions>;

// Navigator options
type StackNavigatorProps = Omit<NativeStackNavigatorProps, 'children'>; // omitting required children prop
type ModalNavigatorProps = StackNavigatorProps;
type TabNavigatorProps = any; // TODO BottomTabNavigatorProps doesn't exist :(
type DrawerNavigatorProps = any; // TODO DrawerNavigatorProps doesn't exist :(

// Definitions
export type TStackDefinition<ScreenName, StackName> =
  | StackName
  | ScreenName[]
  | TStackDataObj<ScreenName>;
export type TDrawerDefinition<DrawerName> = DrawerName; // maybe smth else will be added
export type TTabsDefinition<TabName> = TabName; // maybe smth else will be added
export type TModalsDefinition<ModalName> = ModalName; // maybe smth else will be added

// Data
export type TScreenData<Props = {}> =
  | NavioScreen<Props>
  | {
      component: NavioScreen<Props>;
      options?: ScreenOptions;
    };
// Stack
export type TStackDataObj<ScreenName> = {
  screens: ScreenName[];
  options?: StackScreenOptions;
  navigatorProps?: StackNavigatorProps;
};
export type TStackData<ScreenName> = ScreenName[] | TStackDataObj<ScreenName>;
// Tabs
export type TTabLayoutValue<ScreenName, StackName, DrawersName> = {
  stack?: TStackDefinition<ScreenName, StackName>;
  drawer?: TDrawerDefinition<DrawersName>;
  options?: TabScreenOptions;
};
export type TTabsData<ScreenName, StackName, DrawersName> = {
  layout: Record<string, TTabLayoutValue<ScreenName, StackName, DrawersName>>;
  options?: TabScreenOptions;
  navigatorProps?: TabNavigatorProps;
};
// Drawer
export type TDrawerLayoutValue<ScreenName, StackName, TabsName> = {
  stack?: TStackDefinition<ScreenName, StackName>;
  tabs?: TTabsDefinition<TabsName>;
  options?: DrawerScreenOptions;
};
export type TDrawersData<ScreenName, StackName, TabsName> = {
  layout: Record<string, TDrawerLayoutValue<ScreenName, StackName, TabsName>>;
  options?: DrawerScreenOptions;
  navigatorProps?: DrawerNavigatorProps;
};
// Modal
export type TModalData<ScreenName, StackName> = {
  stack?: TStackDefinition<ScreenName, StackName>;
  options?: ModalScreenOptions;
  // navigatorProps?: ModalNavigatorProps; // we don't need it because we build Navigator.Screen instead of Drawer.Navigator
};

export type TRootName<
  StackName extends string,
  TabsName extends string,
  DrawersName extends string,
> = `tabs.${TabsName}` | `stacks.${StackName}` | `drawers.${DrawersName}`;
export type ExtractProps<Type> = Type extends React.FC<infer X> ? X : never;

// Layout
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
   * Root name to start the app with. Possible values `any of tabs, stacks, drawers names`.
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
  stacks?: {
    screen?: StackScreenOptions;
    container?: ScreenOptions;
  };
  tabs?: {
    screen?: TabScreenOptions;
    container?: ScreenOptions;
  };
  drawers?: {
    screen?: DrawerScreenOptions;
    container?: ScreenOptions;
  };
  modals?: {
    container?: ScreenOptions;
  };
};
export type NavioScreen<Props = {}> = React.FC<PropsWithChildren<Props>> & {
  options?: StackScreenOptions;
};

// Layouts
export type RootProps<RootName extends string> = {
  navigationContainerProps?: Omit<ExtractProps<typeof NavigationContainer>, 'children'>;
  root?: RootName;
};

// Tunnel (Event Emitter)
export type TunnelEvent$UpdateOptions$Params<Name = string, Options = any> = {
  name: Name;
  options: Options;
};

export type TunnelEvent = 'tabs.updateOptions' | 'drawer.updateOptions';
export type TunnelParams<T = any> = T;
export type TunnelListener = (params: TunnelParams) => void;
export type TunnelEvents = Partial<Record<TunnelEvent, TunnelListener[]>>;
