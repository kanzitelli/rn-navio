import React, {useEffect, useMemo, useState} from 'react';
import {createBottomTabNavigator, BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  createNavigationContainerRef,
  DrawerActions,
  NavigationContainer,
  NavigationContainerRef,
  NavigationContainerRefWithCurrent,
  StackActions,
  TabActions,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {createDrawerNavigator, DrawerNavigationOptions} from '@react-navigation/drawer';
import {
  TScreenData,
  TStackData,
  TTabsData,
  TModalData,
  TRootName,
  Layout,
  TStackDefinition,
  NavioScreen,
  BaseOptions,
  RootProps,
  ContainerLayoutKeys,
  TStackDataObj,
  TDrawersData,
  TDrawerDefinition,
  TTabsDefinition,
  RootSetAs,
  TTabLayoutValue,
  TDrawerLayoutValue,
  DefaultOptions,
  TunnelEvent$UpdateOptions$Params,
  TModalsDefinition,
} from './types';
import {NavioTunnel} from './tunnel';
import {safeOpts} from './help';

// Navio
export class Navio<
  ScreenName extends string,
  StackName extends string,
  TabsName extends string,
  ModalName extends string,
  DrawersName extends string,
  //
  ScreenData extends TScreenData,
  StackData extends TStackData<ScreenName>,
  TabsData extends TTabsData<ScreenName, StackName, DrawersName>,
  ModalData extends TModalData<ScreenName, StackName>,
  DrawersData extends TDrawersData<ScreenName, StackName, TabsName>,
  //
  TabsLayoutName extends ContainerLayoutKeys<TabsData> = ContainerLayoutKeys<TabsData>,
  DrawersLayoutName extends ContainerLayoutKeys<DrawersData> = ContainerLayoutKeys<DrawersData>,
  //
  RootName extends TRootName<StackName, TabsName, DrawersName> = TRootName<
    StackName,
    TabsName,
    DrawersName
  >,
  RootSetAsNames extends Record<RootSetAs, string> = {
    stacks: StackName;
    tabs: TabsName;
    drawers: DrawersName;
  },
> {
  static build<
    ScreenName extends string,
    StackName extends string,
    TabsName extends string,
    ModalName extends string,
    DrawersName extends string,
    //
    ScreenData extends TScreenData,
    StackData extends TStackData<ScreenName>,
    TabsData extends TTabsData<ScreenName, StackName, DrawersName>,
    ModalData extends TModalData<ScreenName, StackName>,
    DrawersData extends TDrawersData<ScreenName, StackName, TabsName>,
    //
    TabsLayoutName extends ContainerLayoutKeys<TabsData> = ContainerLayoutKeys<TabsData>,
    DrawersLayoutName extends ContainerLayoutKeys<DrawersData> = ContainerLayoutKeys<DrawersData>,
    //
    RootName extends TRootName<StackName, TabsName, DrawersName> = TRootName<
      StackName,
      TabsName,
      DrawersName
    >,
  >(
    data: Layout<
      Record<ScreenName, ScreenData>,
      Record<StackName, StackData>,
      Record<TabsName, TabsData>,
      Record<ModalName, ModalData>,
      Record<DrawersName, DrawersData>,
      RootName
    >,
  ) {
    const _navio = new Navio<
      ScreenName,
      StackName,
      TabsName,
      ModalName,
      DrawersName,
      ScreenData,
      StackData,
      TabsData,
      ModalData,
      DrawersData,
      TabsLayoutName,
      DrawersLayoutName,
      RootName
    >(data);
    return _navio;
  }

  // ========
  // | Vars |
  // ========
  private layout: Layout<
    Record<ScreenName, ScreenData>,
    Record<StackName, StackData>,
    Record<TabsName, TabsData>,
    Record<ModalName, ModalData>,
    Record<DrawersName, DrawersData>,
    RootName
  >;
  private navRef: NavigationContainerRefWithCurrent<any>;
  private navIsReadyRef: React.MutableRefObject<boolean | null>;

  private tunnel: NavioTunnel;

  // we use them to store tabs updated options during session
  private __tabsUpdatedOptions: Record<string, BottomTabNavigationOptions> = {};
  private __drawerUpdatedOptions: Record<string, DrawerNavigationOptions> = {};

  // ========
  // | Init |
  // ========
  constructor(
    data: Layout<
      Record<ScreenName, ScreenData>,
      Record<StackName, StackData>,
      Record<TabsName, TabsData>,
      Record<ModalName, ModalData>,
      Record<DrawersName, DrawersData>,
      RootName
    >,
  ) {
    // Layout
    this.layout = data;

    // Navigation
    this.navRef = createNavigationContainerRef<any>();
    this.navIsReadyRef = React.createRef<boolean>();

    // Tunnel (event emitter)
    this.tunnel = new NavioTunnel();
  }

  // ===========
  // | Getters |
  // ===========
  get N() {
    return this.navRef;
  }

  useN() {
    // return dump React Navigation webhook
    return useNavigation;
  }

  private get navIsReady() {
    return (
      !!this.navIsReadyRef && this.navIsReadyRef.current && !!this.navRef && !!this.navRef.current
    );
  }

  // ===========
  // | Methods |
  // ===========
  private log(message: string, type: 'log' | 'warn' | 'error' = 'log') {
    console[type](`[navio] ${message}`);
  }

  private __setRoot(routeName: string) {
    const {stacks, tabs, drawers} = this.layout;

    if (stacks && stacks[routeName as StackName]) {
      this.stacks.setRoot(routeName as StackName);
    }
    if (tabs && tabs[routeName as TabsName]) {
      this.tabs.setRoot(routeName as TabsName);
    }
    if (drawers && drawers[routeName as DrawersName]) {
      this.drawers.setRoot(routeName as DrawersName);
    }
  }

  private getSafeRoot(name: RootName | undefined): StackName | TabsName | DrawersName | undefined {
    if (!name) return undefined;
    const {stacks, tabs, drawers} = this.layout;

    const split = name.split('.');
    const type = split[0]; // tabs, stacks, drawers
    const routeName = split.slice(1).join(':');

    if (type === 'tabs') {
      const rName = routeName as TabsName;
      if (!!tabs && !tabs[rName]) {
        this.log('Wrong app root', 'warn');
      }
      return rName;
    }
    if (type === 'stacks') {
      const rName = routeName as StackName;
      if (!!stacks && !stacks[rName]) {
        this.log('Wrong app root', 'warn');
      }
      return rName;
    }
    if (type === 'drawers') {
      const rName = routeName as DrawersName;
      if (!!drawers && !drawers[rName]) {
        this.log('Wrong app root', 'warn');
      }
      return rName;
    }
  }

  private getCustomDefaultOptions(): DefaultOptions {
    return {
      stacks: {
        container: {
          headerShown: false,
        },
      },
      tabs: {
        container: {
          headerShown: false,
        },
        screen: {
          headerShown: false,
        },
      },
      drawers: {
        container: {
          headerShown: false,
        },
        screen: {
          headerShown: false,
        },
      },
      modals: {
        container: {
          headerShown: false,
        },
      },
    };
  }

  protected navigate = <
    T extends ScreenName | StackName | TabsName | ModalName,
    Params extends object | undefined,
  >(
    name: T,
    params?: Params,
  ): void => {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(
        CommonActions.navigate({
          name: name as string,
          params,
        }),
      );
    }
  };

  // ===========
  // | Actions |
  // ===========
  /**
   * `push(...)` action adds a route on top of the stack and navigates forward to it.
   *
   * @param name ScreenName
   * @param params Params
   */
  push<T extends ScreenName, Params extends object | undefined>(name: T, params?: Params) {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(StackActions.push(name as string, params));
    }
  }

  /**
   * `goBack()` action creator allows to go back to the previous route in history.
   */
  goBack() {
    if (this.navIsReady) {
      this.navRef.current?.goBack();
    }
  }

  /**
   * `setParams(...)` action allows to update params for a certain route.
   *
   * @param name all available navigation keys. Leave `undefined` if applying for the focused route.
   * @param params object
   */
  setParams<T extends string, Params extends object>(name: T, params: Params) {
    if (this.navIsReady) {
      this.navRef.current?.dispatch({
        ...CommonActions.setParams(params),
        source: name as string,
      });
    }
  }

  /**
   * `setRoot(as, name)` action sets a new app root.
   *
   * Tips: It can be used to switch between Tabs, Drawers, and Stacks.
   *
   * @param as used to define the type of the app layout. Possible values: 'stacks' | 'tabs' | 'drawers'.
   * @param name will be autocompleted based on `as` value and current layout configuration.
   */
  setRoot<SetAs extends RootSetAs = RootSetAs, RouteName extends string = RootSetAsNames[SetAs]>(
    as: SetAs,
    routeName: RouteName,
  ) {
    if (as) {
      this.__setRoot(routeName);
    }
  }

  /**
   * `stacks` contains navigation actions for stack-based navigators.
   *
   * Available methods:
   *
   * `push`, `pop`, `popToTop`, `setRoot`
   *
   */
  get stacks() {
    // local copy of current instance
    const self = this;

    return {
      /**
       * `push(...)` action adds a route on top of the stack and navigates forward to it.
       *
       * Tips: It will "hide" tabs.
       *
       * @param name StackName
       */
      push<T extends StackName>(name: T) {
        if (self.navIsReady) {
          self.navigate(name);
        }
      },

      /**
       * `pop(...)` action takes you back to a previous screen in the stack.
       *
       * @param count number
       */
      pop(count?: number) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(StackActions.pop(count));
        }
      },

      /**
       * `popToPop()` action takes you back to the first screen in the stack, dismissing all the others.
       */
      popToTop() {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(StackActions.popToTop());
        }
      },

      /**
       * `setRoot(...)` action sets a new app root from stacks.
       *
       * Tips: It can be used to switch between Auth and App stacks.
       *
       * @param name StackName
       */
      setRoot<T extends StackName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(
            CommonActions.reset({
              routes: [{name}],
            }),
          );
        }
      },
    };
  }

  /**
   * `tabs` contains navigation actions for tab-based navigators.
   *
   * Available methods:
   *
   * `jumpTo`, `setRoot`
   *
   */
  get tabs() {
    // local copy of current instance
    const self = this;

    return {
      /**
       * `jumpTo(...)` action can be used to jump to an existing route in the tab navigator.
       *
       * @param name TabName
       */
      jumpTo<T extends TabsLayoutName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(TabActions.jumpTo(name as string));
        }
      },

      /**
       * `updateOptions(...)` action updates provided tab's options.
       *
       * Tips: It can be used to update badge count.
       *
       * @param name name of the tab
       * @param options `BottomTabNavigationOptions` options for the tab.
       */
      updateOptions<T extends TabsLayoutName>(name: T, options: BottomTabNavigationOptions) {
        if (self.navIsReady) {
          self.tunnel.echo('tabs.updateOptions', {
            name,
            options,
          } as TunnelEvent$UpdateOptions$Params<TabsLayoutName, BottomTabNavigationOptions>);
        }
      },

      /**
       * `setRoot(...)` action sets a new app root from tabs.
       *
       * Tips: It can be used to switch between Auth and Tabs.
       *
       * @param name TabsName
       */
      setRoot<T extends TabsName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(
            CommonActions.reset({
              routes: [{name}],
            }),
          );
        }
      },
    };
  }

  /**
   * `modals` contains navigation actions for modals.
   *
   * Available methods:
   *
   * `show`
   *
   */
  get modals() {
    // local copy of current instance
    const self = this;

    return {
      /**
       * `show(...)` action can be used to show an existing modal.
       *
       * @param name ModalName
       */
      show<T extends ModalName>(name: T) {
        if (self.navIsReady) {
          self.navigate(name);
        }
      },
    };
  }

  /**
   * `drawers` contains navigation actions for drawer-based navigators.
   *
   * Available methods:
   *
   * `open`, `close`, `toggle`, `jumpTo`, `setRoot`
   *
   */
  get drawers() {
    // local copy of current instance
    const self = this;

    return {
      /**
       * `open()` action can be used to open the drawer pane.
       */
      open() {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(DrawerActions.openDrawer());
        }
      },

      /**
       * `close()` action can be used to close the drawer pane.
       */
      close() {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(DrawerActions.closeDrawer());
        }
      },

      /**
       * `toggle()` action can be used to open the drawer pane if closed, or close if open.
       */
      toggle() {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(DrawerActions.toggleDrawer());
        }
      },

      /**
       * `jumpTo(...)` action can be used to jump to an existing route in the drawer navigator.
       *
       * @param name StacksName
       */
      jumpTo<T extends DrawersLayoutName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(DrawerActions.jumpTo(name as string));
        }
      },

      /**
       * `updateOptions(...)` action updates provided drawer's options.
       *
       * @param name name of the drawer layout
       * @param options `DrawerNavigationOptions` options for the drawer.
       */
      updateOptions<T extends DrawersLayoutName>(name: T, options: DrawerNavigationOptions) {
        if (self.navIsReady) {
          self.tunnel.echo('drawer.updateOptions', {
            name,
            options,
          } as TunnelEvent$UpdateOptions$Params<DrawersLayoutName, DrawerNavigationOptions>);
        }
      },

      /**
       * `setRoot(...)` action sets a new app root from drawers.
       *
       * Tips: It can be used to switch between Auth and Drawers.
       *
       * @param name DrawersName
       */
      setRoot<T extends DrawersName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(
            CommonActions.reset({
              routes: [{name}],
            }),
          );
        }
      },
    };
  }

  // ===========
  // | Layouts |
  // ===========
  // | Stacks |
  // some getters for Stack
  private __StackGetNavigatorProps = (
    definition: TStackDefinition<ScreenName, StackName> | undefined,
  ) => {
    const {stacks} = this.layout;
    if (stacks === undefined) return {};

    return Array.isArray(definition)
      ? // if definition is ScreenName[]
        {}
      : // if stackDev is TStacksDataObj
      typeof definition === 'object'
      ? (definition as TStackDataObj<ScreenName>).navigatorProps ?? {}
      : // if stackDev is StacksName -> look into stacks[...]
      typeof definition === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[definition])
        ? {}
        : // if stacks[name] is TStacksDataObj
        typeof stacks[definition] === 'object'
        ? (stacks[definition] as TStackDataObj<ScreenName>).navigatorProps ?? {}
        : {}
      : {};
  };
  private __StackGetContainerOpts = (
    definition: TStackDefinition<ScreenName, StackName> | undefined,
  ) => {
    const {stacks} = this.layout;
    if (stacks === undefined) return {};

    return Array.isArray(definition)
      ? // if definition is ScreenName[]
        {}
      : // if stackDev is TStacksDataObj
      typeof definition === 'object'
      ? (definition as TStackDataObj<ScreenName>).options ?? {}
      : // if stackDev is StacksName -> look into stacks[...]
      typeof definition === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[definition])
        ? {}
        : // if stacks[name] is TStacksDataObj
        typeof stacks[definition] === 'object'
        ? (stacks[definition] as TStackDataObj<ScreenName>).options ?? {}
        : {}
      : {};
  };
  private __StackGetScreens = (definition: TStackDefinition<ScreenName, StackName> | undefined) => {
    const {stacks} = this.layout;
    if (stacks === undefined) return [];

    return Array.isArray(definition)
      ? // if definition is ScreenName[]
        (definition as ScreenName[])
      : // if definition is TStacksDataObj
      typeof definition === 'object'
      ? (definition as TStackDataObj<ScreenName>).screens ?? []
      : // if definition is StacksName -> look into stacks[...]
      typeof definition === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[definition])
        ? (stacks[definition] as ScreenName[])
        : // if stacks[name] is TStacksDataObj
        typeof stacks[definition] === 'object'
        ? (stacks[definition] as TStackDataObj<ScreenName>).screens ?? []
        : []
      : [];
  };

  private StackScreen: React.FC<{
    StackNavigator: ReturnType<typeof createNativeStackNavigator>;
    name: ScreenName;
  }> = ({StackNavigator, name}) => {
    const {screens, defaultOptions: globalDefaultOptions} = this.layout;

    const screen = screens[name];

    // component
    // -- handling when screen is a component or object{component,options}
    let sComponent: NavioScreen;
    let sOptions: BaseOptions<NativeStackNavigationOptions>;
    if (typeof screen === 'object') {
      if (screen.component) {
        // {component,options}
        sComponent = screen.component;
        sOptions = screen.options ?? {};
      } else {
        // component
        // this might happen if a screen is provided as wrapped component, for ex. const Main: React.FC = observer(() => {}); (observer from mobx)
        sComponent = screen as any;
        sOptions = {};
      }
    } else {
      // component
      sComponent = screen;
      sOptions = {};
    }
    const C = sComponent;

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.stacks?.screen ?? {};
    const defaultOptions = globalDefaultOptions?.stacks?.screen ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(defaultOptions)(props), // navio.defaultOptions.stacks.screen
      ...safeOpts(sOptions)(props), // navio.screens.[].options
      ...safeOpts(C.options)(props), // component-based options
    }); // must be function. merge options from buildNavio and from component itself. also providing default options

    // screen
    return <StackNavigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  private Stack: React.FC<{
    definition: TStackDefinition<ScreenName, StackName> | undefined;
  }> = ({definition}) => {
    if (!definition) return null;
    const {screens, stacks, hooks} = this.layout;

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    if (!screens) {
      this.log('No screens registered');
      return <></>;
    }
    if (!stacks) {
      this.log('No stacks registered');
      return <></>;
    }

    // -- building navigator
    const Stack = createNativeStackNavigator();
    const StackScreensMemo = useMemo(() => {
      return this.__StackGetScreens(definition).map(sk =>
        this.StackScreen({StackNavigator: Stack, name: sk}),
      );
    }, [definition, screens, stacks]);

    // -- getting navigator props
    const navigatorProps = this.__StackGetNavigatorProps(definition);

    return <Stack.Navigator {...navigatorProps}>{StackScreensMemo}</Stack.Navigator>;
  };

  private StackContainer: React.FC<{
    Navigator: ReturnType<typeof createNativeStackNavigator>;
    name: StackName;
    definition: TStackDefinition<ScreenName, StackName> | undefined;
  }> = ({Navigator, definition, name}) => {
    const {defaultOptions: globalDefaultOptions} = this.layout;

    // component
    const C = () => this.Stack({definition});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.stacks?.container ?? {};
    const defaultOptions = globalDefaultOptions?.tabs?.container ?? {};
    const options = this.__StackGetContainerOpts(definition);
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // ! custom default options
      ...safeOpts(defaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(options)(props), // navio.stacks.[].options
    }); // must be function. merge options from buildNavio. also providing default options

    return (
      <Navigator.Screen key={name} name={name} options={Opts}>
        {(props: any) => <C {...props} />}
      </Navigator.Screen>
    );
  };

  // | Tabs |
  private __TabsGet = (definition: TTabsDefinition<TabsName> | undefined) => {
    const {tabs} = this.layout;
    if (tabs === undefined) return undefined;

    const currentTabs: TTabsData<ScreenName, StackName, DrawersName> | undefined =
      typeof definition === 'string' ? tabs[definition] : undefined;

    return currentTabs;
  };

  private TabScreen: React.FC<{
    TabNavigator: ReturnType<typeof createBottomTabNavigator>;
    name: string; // TabsLayoutName
    layout: TTabLayoutValue<ScreenName, StackName, DrawersName>;
  }> = ({TabNavigator, name, layout}) => {
    if (!layout.stack && !layout.drawer) {
      this.log(`Either 'stack' or 'drawer' must be provided for "${name}" tabs layout.`);
      return null;
    }

    // component
    const C = () =>
      layout.stack
        ? this.Stack({definition: layout.stack})
        : layout.drawer
        ? this.Drawer({definition: layout.drawer})
        : null;

    return <TabNavigator.Screen key={name} name={name} component={C} />;
  };

  private Tabs: React.FC<{
    definition: TTabsDefinition<TabsName> | undefined;
  }> = ({definition}) => {
    const {tabs, hooks, defaultOptions: globalDefaultOptions} = this.layout;

    // -- pre-checks
    if (!tabs) {
      this.log('No tabs registered');
      return <></>;
    }

    const currentTabs = this.__TabsGet(definition);
    if (!currentTabs) {
      this.log('No tabs defined found');
      return <></>;
    }

    // -- internal state
    const [updatedOptions, setUpdatedOptions] = useState<
      Record<string, BottomTabNavigationOptions>
    >({});

    // -- internal effects
    useEffect(() => {
      this.tunnel.on(
        'tabs.updateOptions',
        (params: TunnelEvent$UpdateOptions$Params<string, BottomTabNavigationOptions>) => {
          const tcname = params.name;
          const tcopts = params.options;
          this.__tabsUpdatedOptions = {
            ...this.__tabsUpdatedOptions,
            [tcname]: {...this.__tabsUpdatedOptions[tcname], ...tcopts},
          };
          setUpdatedOptions(this.__tabsUpdatedOptions);
        },
      );
    }, [definition]);

    // -- internal memos
    const currentTabsLayout = useMemo(() => currentTabs.layout, [currentTabs]);
    const currentTabsLayoutKeys = useMemo(
      () => Object.keys(currentTabsLayout),
      [currentTabsLayout],
    );

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Tabs = useMemo(() => createBottomTabNavigator(), [tabs]);
    const TabScreensMemo = useMemo(
      () =>
        currentTabsLayoutKeys.map(key =>
          this.TabScreen({
            name: key,
            TabNavigator: Tabs,
            layout: currentTabs.layout[key as string],
          }),
        ),
      [Tabs, currentTabsLayoutKeys],
    );

    // options
    const Opts: BaseOptions<BottomTabNavigationOptions> = props => {
      const rName = props?.route?.name;
      if (!rName) return {};

      const customDefaultOptions = this.getCustomDefaultOptions()?.tabs?.screen ?? {};
      const defaultOpts = globalDefaultOptions?.tabs?.screen ?? {};
      const navigatorScreenOptions = currentTabs?.navigatorProps?.screenOptions ?? {};
      const options = (currentTabs?.layout[rName] as any)?.options ?? {};
      const _updatedOptions = updatedOptions[rName] ?? {};
      return {
        ...safeOpts(customDefaultOptions)(props), // [!] custom default options
        ...safeOpts(defaultOpts)(props), // navio.defaultOptions.tabs.screen
        ...safeOpts(navigatorScreenOptions)(props), // navio.tabs.[].navigatorProps.screenOptions -- because we override it below
        ...safeOpts(options)(props), // tab-based options
        ...safeOpts(_updatedOptions)(props), // upddated options (navio.tabs.updateOptions())
      };
    }; // must be function. merge options from buildNavio. also providing default options

    return (
      <Tabs.Navigator {...currentTabs.navigatorProps} screenOptions={Opts}>
        {TabScreensMemo}
      </Tabs.Navigator>
    );
  };

  private TabsContainer: React.FC<{
    Navigator: ReturnType<typeof createNativeStackNavigator>;
    name: TabsName;
    definition: TTabsDefinition<TabsName> | undefined;
  }> = ({Navigator, definition, name}) => {
    const {defaultOptions: globalDefaultOptions} = this.layout;

    // component
    const C = () => this.Tabs({definition});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.tabs?.container ?? {};
    const defaultOptions = globalDefaultOptions?.tabs?.container ?? {};
    const options = this.__TabsGet(definition)?.options ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(defaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(options)(props), // navio.tabs.[].options
    }); // must be function. merge options from buildNavio. also providing default options

    return <Navigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  // | Drawers |
  private __DrawerGet = (definition: TDrawerDefinition<DrawersName> | undefined) => {
    const {drawers} = this.layout;
    if (drawers === undefined) return undefined;

    const current: TDrawersData<ScreenName, StackName, TabsName> | undefined =
      typeof definition === 'string' ? drawers[definition] : undefined;

    return current;
  };

  private DrawerScreen: React.FC<{
    DrawerNavigator: ReturnType<typeof createDrawerNavigator>;
    name: string;
    layout: TDrawerLayoutValue<ScreenName, StackName, TabsName>;
  }> = ({DrawerNavigator, name, layout}) => {
    if (!layout.stack && !layout.tabs) {
      this.log(`Either 'stack' or 'tabs' must be provided for "${name}" drawer layout.`);
      return null;
    }

    // component
    const C = () =>
      layout.stack
        ? this.Stack({definition: layout.stack})
        : layout.tabs
        ? this.Tabs({definition: layout.tabs})
        : null;

    // screen
    return <DrawerNavigator.Screen key={name} name={name} component={C} />;
  };

  private Drawer: React.FC<{
    definition: TDrawerDefinition<DrawersName> | undefined;
  }> = ({definition}) => {
    const {drawers, defaultOptions: globalDefaultOptions, hooks} = this.layout;

    if (!drawers) {
      this.log('No drawers registered');
      return <></>;
    }

    const currentDrawer = this.__DrawerGet(definition);
    if (!currentDrawer) {
      this.log('No drawer found');
      return <></>;
    }

    // -- internal state
    const [updatedOptions, setUpdatedOptions] = useState<Record<string, DrawerNavigationOptions>>(
      {},
    );

    // -- internal effects
    useEffect(() => {
      this.tunnel.on(
        'drawer.updateOptions',
        (params: TunnelEvent$UpdateOptions$Params<string, DrawerNavigationOptions>) => {
          const name = params.name;
          const opts = params.options;
          this.__drawerUpdatedOptions = {
            ...this.__drawerUpdatedOptions,
            [name]: {...this.__drawerUpdatedOptions[name], ...opts},
          };
          setUpdatedOptions(this.__drawerUpdatedOptions);
        },
      );
    }, [definition]);

    // -- internal memos
    const currentDrawerLayout = useMemo(() => currentDrawer.layout, [currentDrawer]);
    const currentDrawerLayoutKeys = useMemo(
      () => Object.keys(currentDrawerLayout),
      [currentDrawerLayout],
    );

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Drawer = useMemo(() => createDrawerNavigator(), [drawers]);
    const DrawerScreensMemo = useMemo(() => {
      return currentDrawerLayoutKeys.map(key =>
        this.DrawerScreen({
          name: key,
          DrawerNavigator: Drawer,
          layout: currentDrawer.layout[key],
        }),
      );
    }, [Drawer, currentDrawerLayoutKeys]);

    // options
    const Opts: BaseOptions<BottomTabNavigationOptions> = props => {
      const rName = props?.route?.name;
      if (!rName) return {};

      const customDefaultOptions = this.getCustomDefaultOptions()?.drawers?.screen ?? {};
      const defaultOptions = globalDefaultOptions?.drawers?.screen ?? {};
      const navigatorScreenOptions = currentDrawer?.navigatorProps?.screenOptions ?? {};
      const options = (currentDrawer?.layout[rName] as any)?.options ?? {};
      const _updatedOptions = updatedOptions[rName] ?? {};
      return {
        ...safeOpts(customDefaultOptions)(props), // [!] custom default options
        ...safeOpts(defaultOptions)(props), // navio.defaultOptions.drawers.screen
        ...safeOpts(navigatorScreenOptions)(props), // navio.drawers.[].navigatorProps.screenOptions -- because we override it below
        ...safeOpts(options)(props), // tab-based options
        ...safeOpts(_updatedOptions)(props), // upddated options (navio.drawers.updateOptions())
      };
    }; // must be function. merge options from buildNavio. also providing default options

    return (
      <Drawer.Navigator {...currentDrawer.navigatorProps} screenOptions={Opts}>
        {DrawerScreensMemo}
      </Drawer.Navigator>
    );
  };

  private DrawerContainer: React.FC<{
    Navigator: ReturnType<typeof createNativeStackNavigator>;
    name: DrawersName;
    definition: TDrawerDefinition<DrawersName> | undefined;
  }> = ({Navigator, definition, name}) => {
    const {defaultOptions: globalDefaultOptions} = this.layout;

    // component
    const C = () => this.Drawer({definition});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.drawers?.container ?? {};
    const defaultOptions = globalDefaultOptions?.drawers?.container ?? {};
    const options = this.__DrawerGet(definition)?.options ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(defaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(options)(props), // navio.stacks.[].options
    }); // must be function. merge options from buildNavio. also providing default options

    return <Navigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  // | Modals |
  private __ModalGet = (definition: TModalsDefinition<ModalName> | undefined) => {
    const {modals} = this.layout;
    if (modals === undefined) return undefined;

    const currentModal: TModalData<ScreenName, StackName> | undefined =
      typeof definition === 'string' ? modals[definition] : undefined;

    return currentModal;
  };

  private ModalContainer: React.FC<{
    Navigator: ReturnType<typeof createNativeStackNavigator>;
    name: ModalName;
    definition: TModalsDefinition<ModalName> | undefined;
  }> = ({Navigator, definition, name}) => {
    const {defaultOptions: globalDefaultOptions} = this.layout;

    const currentModal = this.__ModalGet(definition);
    if (!currentModal) {
      this.log('No modal found');
      return <></>;
    }

    // component
    const C = () => this.Stack({definition: currentModal?.stack});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.modals?.container ?? {};
    const defaultOptions = globalDefaultOptions?.modals?.container ?? {};
    const options = currentModal?.options ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(defaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(options)(props), // navio.modals.[].options
    }); // must be function. merge options from buildNavio. also providing default options

    return <Navigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  /**
   * Generates `<Root />` component for provided layout. Returns Stack Navigator.
   */
  private Root: React.FC<RootProps<RootName>> = ({root: parentRoot}) => {
    const {stacks, tabs, modals, drawers, root} = this.layout;
    const AppNavigator = createNativeStackNavigator();
    const appRoot = this.getSafeRoot(parentRoot ?? root);

    if (!appRoot) {
      this.log('No modal found');
      return <></>;
    }

    // Effects
    useEffect(() => {
      // -- changing route if `root` was changed
      if (!!appRoot) {
        this.__setRoot(appRoot);
      }
      // listening to changes of parentRoot, but setting appRoot value
    }, [parentRoot]);

    // UI Methods
    // -- app stacks
    const AppStacks = useMemo(() => {
      if (!stacks) return null;

      const stacksKeys = Object.keys(stacks) as StackName[];
      return stacksKeys.map(key =>
        this.StackContainer({Navigator: AppNavigator, name: key, definition: stacks[key]}),
      );
    }, [stacks]);

    // -- app tabs
    const AppTabs = useMemo(() => {
      if (!tabs) return null;

      const tabsKeys = Object.keys(tabs) as TabsName[];
      return tabsKeys.map(key =>
        this.TabsContainer({Navigator: AppNavigator, name: key, definition: key}),
      );
    }, [tabs]);

    // -- app drawers
    const AppDrawers = useMemo(() => {
      if (!drawers) return null;

      const drawersKeys = Object.keys(drawers) as DrawersName[];
      return drawersKeys.map(key =>
        this.DrawerContainer({Navigator: AppNavigator, name: key, definition: key}),
      );
    }, [drawers]);

    // -- app modals
    const AppModals = useMemo(() => {
      if (!modals) return null;

      const modalsKeys = Object.keys(modals) as ModalName[];
      return modalsKeys.map(key =>
        this.ModalContainer({Navigator: AppNavigator, name: key, definition: key}),
      );
    }, [modals]);

    // -- app root
    const AppRoot = useMemo(() => {
      return (
        <AppNavigator.Navigator initialRouteName={appRoot as string}>
          {/* Stacks */}
          <AppNavigator.Group>{AppStacks}</AppNavigator.Group>

          {/* Tabs */}
          <AppNavigator.Group>{AppTabs}</AppNavigator.Group>

          {/* Drawers */}
          <AppNavigator.Group>{AppDrawers}</AppNavigator.Group>

          {/* Modals */}
          <AppNavigator.Group screenOptions={{presentation: 'modal'}}>
            {AppModals}
          </AppNavigator.Group>
        </AppNavigator.Navigator>
      );
    }, [appRoot]);

    return AppRoot;
  };

  /**
   * Generates your app's root component for provided layout.
   * Can be used as `<AppProviders><navio.App /></AppProviders>`
   */
  App: React.FC<RootProps<RootName>> = ({navigationContainerProps, root: parentRoot}) => {
    // Navigation-related methods
    const _navContainerRef = (instance: NavigationContainerRef<{}> | null) => {
      this.navRef.current = instance;
    };

    const _navContainerOnReady = () => {
      this.navIsReadyRef.current = true;

      if (navigationContainerProps?.onReady) {
        navigationContainerProps?.onReady();
      }
    };

    return (
      <NavigationContainer
        {...navigationContainerProps}
        ref={_navContainerRef}
        onReady={_navContainerOnReady}
      >
        <this.Root root={parentRoot} />
      </NavigationContainer>
    );
  };
}
