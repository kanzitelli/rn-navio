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
  ContentKeys,
  TStackDataObj,
  TDrawersData,
  TDrawerDefinition,
  TTabsDefinition,
  RootSetAs,
  TTabsContentValue,
  TDrawerContentValue,
  DefaultOptions,
  TunnelEvent$Tabs$UpdateOptions$Params,
} from './types';
import {NavioTunnel} from './tunnel';
import {safeOpts} from './help';

// Navio
export class Navio<
  ScreensName extends string,
  StacksName extends string,
  TabsName extends string,
  ModalsName extends string,
  DrawersName extends string,
  //
  ScreensData extends TScreenData,
  StacksData extends TStackData<ScreensName>,
  TabsData extends TTabsData<ScreensName, StacksName, DrawersName>,
  ModalsData extends TModalData<ScreensName, StacksName>,
  DrawersData extends TDrawersData<ScreensName, StacksName, TabsName>,
  //
  TabsContentName extends ContentKeys<TabsData> = ContentKeys<TabsData>,
  DrawersContentName extends ContentKeys<DrawersData> = ContentKeys<DrawersData>,
  //
  RootName extends TRootName<StacksName, TabsName, DrawersName> = TRootName<
    StacksName,
    TabsName,
    DrawersName
  >,
  RootSetAsNames extends Record<RootSetAs, string> = {
    stacks: StacksName;
    tabs: TabsName;
    drawers: DrawersName;
  },
> {
  static build<
    ScreensName extends string,
    StacksName extends string,
    TabsName extends string,
    ModalsName extends string,
    DrawersName extends string,
    //
    ScreensData extends TScreenData,
    StacksData extends TStackData<ScreensName>,
    TabsData extends TTabsData<ScreensName, StacksName, DrawersName>,
    ModalsData extends TModalData<ScreensName, StacksName>,
    DrawersData extends TDrawersData<ScreensName, StacksName, TabsName>,
    //
    TabsContentName extends ContentKeys<TabsData> = ContentKeys<TabsData>,
    DrawersContentName extends ContentKeys<DrawersData> = ContentKeys<DrawersData>,
    //
    RootName extends TRootName<StacksName, TabsName, DrawersName> = TRootName<
      StacksName,
      TabsName,
      DrawersName
    >,
  >(
    data: Layout<
      Record<ScreensName, ScreensData>,
      Record<StacksName, StacksData>,
      Record<TabsName, TabsData>,
      Record<ModalsName, ModalsData>,
      Record<DrawersName, DrawersData>,
      RootName
    >,
  ) {
    const _navio = new Navio<
      ScreensName,
      StacksName,
      TabsName,
      ModalsName,
      DrawersName,
      ScreensData,
      StacksData,
      TabsData,
      ModalsData,
      DrawersData,
      TabsContentName,
      DrawersContentName,
      RootName
    >(data);
    return _navio;
  }

  // ========
  // | Vars |
  // ========
  private layout: Layout<
    Record<ScreensName, ScreensData>,
    Record<StacksName, StacksData>,
    Record<TabsName, TabsData>,
    Record<ModalsName, ModalsData>,
    Record<DrawersName, DrawersData>,
    RootName
  >;
  private navRef: NavigationContainerRefWithCurrent<any>;
  private navIsReadyRef: React.MutableRefObject<boolean | null>;

  private tunnel: NavioTunnel;

  // we use them to store tabs updated options during session
  private __tabsUpdatedOptions: Record<string, BottomTabNavigationOptions> = {};

  // ========
  // | Init |
  // ========
  constructor(
    data: Layout<
      Record<ScreensName, ScreensData>,
      Record<StacksName, StacksData>,
      Record<TabsName, TabsData>,
      Record<ModalsName, ModalsData>,
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

    if (stacks && stacks[routeName as StacksName]) {
      this.stacks.setRoot(routeName as StacksName);
    }
    if (tabs && tabs[routeName as TabsName]) {
      this.tabs.setRoot(routeName as TabsName);
    }
    if (drawers && drawers[routeName as DrawersName]) {
      this.drawers.setRoot(routeName as DrawersName);
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
    T extends ScreensName | StacksName | TabsName | ModalsName,
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
   * @param name ScreensName
   * @param params Params
   */
  push<T extends ScreensName, Params extends object | undefined>(name: T, params?: Params) {
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
  setParams<T extends string>(name: T, params: object) {
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
       * @param name StacksName
       */
      push<T extends StacksName>(name: T) {
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
       * @param name StacksName
       */
      setRoot<T extends StacksName>(name: T) {
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
      jumpTo<T extends TabsContentName>(name: T) {
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
      updateOptions<T extends TabsContentName>(name: T, options: BottomTabNavigationOptions) {
        if (self.navIsReady) {
          self.tunnel.echo('tabs.updateOptions', {
            name,
            options,
          } as TunnelEvent$Tabs$UpdateOptions$Params<TabsContentName>);
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
       * @param name ModalsName
       */
      show<T extends ModalsName>(name: T) {
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
      jumpTo<T extends DrawersContentName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(DrawerActions.jumpTo(name as string));
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
    definition: TStackDefinition<ScreensName, StacksName> | undefined,
  ) => {
    const {stacks} = this.layout;
    if (stacks === undefined) return {};

    return Array.isArray(definition)
      ? // if definition is ScreenName[]
        {}
      : // if stackDev is TStacksDataObj
      typeof definition === 'object'
      ? (definition as TStackDataObj<ScreensName>).navigatorProps ?? {}
      : // if stackDev is StacksName -> look into stacks[...]
      typeof definition === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[definition])
        ? {}
        : // if stacks[name] is TStacksDataObj
        typeof stacks[definition] === 'object'
        ? (stacks[definition] as TStackDataObj<ScreensName>).navigatorProps ?? {}
        : {}
      : {};
  };
  private __StackGetContainerOpts = (
    definition: TStackDefinition<ScreensName, StacksName> | undefined,
  ) => {
    const {stacks} = this.layout;
    if (stacks === undefined) return {};

    return Array.isArray(definition)
      ? // if definition is ScreenName[]
        {}
      : // if stackDev is TStacksDataObj
      typeof definition === 'object'
      ? (definition as TStackDataObj<ScreensName>).containerOptions ?? {}
      : // if stackDev is StacksName -> look into stacks[...]
      typeof definition === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[definition])
        ? {}
        : // if stacks[name] is TStacksDataObj
        typeof stacks[definition] === 'object'
        ? (stacks[definition] as TStackDataObj<ScreensName>).containerOptions ?? {}
        : {}
      : {};
  };
  private __StackGetScreens = (
    definition: TStackDefinition<ScreensName, StacksName> | undefined,
  ) => {
    const {stacks} = this.layout;
    if (stacks === undefined) return [];

    return Array.isArray(definition)
      ? // if definition is ScreenName[]
        (definition as ScreensName[])
      : // if definition is TStacksDataObj
      typeof definition === 'object'
      ? (definition as TStackDataObj<ScreensName>).screens ?? []
      : // if definition is StacksName -> look into stacks[...]
      typeof definition === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[definition])
        ? (stacks[definition] as ScreensName[])
        : // if stacks[name] is TStacksDataObj
        typeof stacks[definition] === 'object'
        ? (stacks[definition] as TStackDataObj<ScreensName>).screens ?? []
        : []
      : [];
  };

  private StackContainer: React.FC<{
    Stack: ReturnType<typeof createNativeStackNavigator>;
    name: StacksName;
    definition: TStackDefinition<ScreensName, StacksName> | undefined;
  }> = ({Stack, definition, name}) => {
    const {defaultOptions} = this.layout;

    // component
    const C = () => this.Stack({stackDef: definition});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.stacks?.container ?? {};
    const containerDefaultOptions = defaultOptions?.tabs?.container ?? {};
    const containerOptions = this.__StackGetContainerOpts(definition);
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // ! custom default options
      ...safeOpts(containerDefaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(containerOptions)(props), // navio.stacks.[].containerOptions
    }); // must be function. merge options from buildNavio. also providing default options

    return <Stack.Screen key={name} name={name} component={C} options={Opts} />;
  };

  private Stack: React.FC<{
    stackDef: TStackDefinition<ScreensName, StacksName> | undefined;
  }> = ({stackDef}) => {
    if (!stackDef) return null;
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

    // -- getting navigator props
    const navigatorProps = this.__StackGetNavigatorProps(stackDef);

    // -- building navigator
    const Stack = createNativeStackNavigator();
    const StackScreensMemo = useMemo(() => {
      return this.__StackGetScreens(stackDef).map(sk =>
        this.StackScreen({StackNavigator: Stack, name: sk}),
      );
    }, [stackDef, screens, stacks]);

    return <Stack.Navigator {...navigatorProps}>{StackScreensMemo}</Stack.Navigator>;
  };

  private StackScreen: React.FC<{
    StackNavigator: ReturnType<typeof createNativeStackNavigator>;
    name: ScreensName;
  }> = ({StackNavigator, name}) => {
    const {screens, defaultOptions} = this.layout;

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
    const sDefaultOptions = defaultOptions?.stacks?.screen ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(sDefaultOptions)(props), // navio.defaultOptions.stacks.screen
      ...safeOpts(sOptions)(props), // navio.screens.[].options
      ...safeOpts(C.options)(props), // component-based options
    }); // must be function. merge options from buildNavio and from component itself. also providing default options

    // screen
    return <StackNavigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  // | Tabs |
  private __TabsGet = (definition: TTabsDefinition<TabsName> | undefined) => {
    const {tabs} = this.layout;
    if (tabs === undefined) return undefined;

    const currentTabs: TTabsData<ScreensName, StacksName, DrawersName> | undefined =
      typeof definition === 'string' ? tabs[definition] : undefined;

    return currentTabs;
  };

  private TabsContainer: React.FC<{
    StackNavigator: ReturnType<typeof createNativeStackNavigator>;
    name: TabsName;
    definition: TTabsDefinition<TabsName> | undefined;
  }> = ({StackNavigator, definition, name}) => {
    const {defaultOptions} = this.layout;

    // component
    const C = () => this.Tabs({tabsDef: definition});

    // options
    const containerDefaultOptions = defaultOptions?.tabs?.container ?? {};
    const customDefaultOptions = this.getCustomDefaultOptions()?.tabs?.container ?? {};
    const containerOptions = this.__TabsGet(definition)?.containerOptions ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(containerDefaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(containerOptions)(props), // navio.tabs.[].containerOptions
    }); // must be function. merge options from buildNavio. also providing default options

    return <StackNavigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  private Tabs: React.FC<{
    tabsDef: TTabsDefinition<TabsName> | undefined;
  }> = ({tabsDef}) => {
    const {tabs, hooks, defaultOptions} = this.layout;

    // -- pre-checks
    if (!tabs) {
      this.log('No tabs registered');
      return <></>;
    }

    const currentTabs = this.__TabsGet(tabsDef);
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
        (params: TunnelEvent$Tabs$UpdateOptions$Params<string>) => {
          const tcname = params.name;
          const tcopts = params.options;
          this.__tabsUpdatedOptions = {
            ...this.__tabsUpdatedOptions,
            [tcname]: {...this.__tabsUpdatedOptions[tcname], ...tcopts},
          };
          setUpdatedOptions(this.__tabsUpdatedOptions);
        },
      );
    }, [tabsDef]);

    // -- internal memos
    const currentTabsContent = useMemo(() => currentTabs.content, [currentTabs]);
    const currentTabsContentKeys = useMemo(
      () => Object.keys(currentTabsContent),
      [currentTabsContent],
    );

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Tabs = useMemo(() => createBottomTabNavigator(), [tabs]);
    const TabScreensMemo = useMemo(
      () =>
        currentTabsContentKeys.map(key =>
          this.TabScreen({
            name: key,
            TabNavigator: Tabs,
            content: currentTabs.content[key as string],
          }),
        ),
      [Tabs, currentTabsContentKeys],
    );

    // options
    const Opts: BaseOptions<BottomTabNavigationOptions> = props => {
      const rName = props?.route?.name;
      if (!rName) return {};

      const customDefaultOptions = this.getCustomDefaultOptions()?.tabs?.screen ?? {};
      const tcsDefaultOpts = defaultOptions?.tabs?.screen ?? {};
      const tcsOpts = (currentTabs?.content[rName] as any)?.options ?? {};
      const tcnpOpts = currentTabs?.navigatorProps?.screenOptions ?? {};
      const updOpts = updatedOptions[rName] ?? {};
      return {
        ...safeOpts(customDefaultOptions)(props), // [!] custom default options
        ...safeOpts(tcsDefaultOpts)(props), // navio.defaultOptions.tabs.screen
        ...safeOpts(tcnpOpts)(props), // navio.tabs.[].navigatorProps.screenOptions -- because we override it below
        ...safeOpts(tcsOpts)(props), // tab-based options
        ...safeOpts(updOpts)(props), // upddated options (navio.tabs.updateOptions())
      };
    }; // must be function. merge options from buildNavio. also providing default options

    return (
      <Tabs.Navigator {...currentTabs.navigatorProps} screenOptions={Opts}>
        {TabScreensMemo}
      </Tabs.Navigator>
    );
  };

  private TabScreen: React.FC<{
    TabNavigator: ReturnType<typeof createBottomTabNavigator>;
    name: string; // TabsContentName
    content: TTabsContentValue<ScreensName, StacksName, DrawersName>;
  }> = ({TabNavigator, name, content}) => {
    if (!content.stack && !content.drawer) {
      this.log(`Either 'stack' or 'drawer' must be provided for "${name}" tabs content.`);
      return null;
    }

    // component
    const C = () =>
      content.stack
        ? this.Stack({stackDef: content.stack})
        : content.drawer
        ? this.Drawer({drawerDef: content.drawer})
        : null;

    return <TabNavigator.Screen key={name} name={name} component={C} />;
  };

  // | Drawers |
  private __DrawerGet = (definition: TDrawerDefinition<DrawersName> | undefined) => {
    const {drawers} = this.layout;
    if (drawers === undefined) return undefined;

    const current: TDrawersData<ScreensName, StacksName, TabsName> | undefined =
      typeof definition === 'string' ? drawers[definition] : undefined;

    return current;
  };

  private DrawerContainer: React.FC<{
    StackNavigator: ReturnType<typeof createNativeStackNavigator>;
    name: DrawersName;
    definition: TDrawerDefinition<DrawersName> | undefined;
  }> = ({StackNavigator, definition, name}) => {
    const {defaultOptions} = this.layout;

    // component
    const C = () => this.Drawer({drawerDef: definition});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.drawers?.container ?? {};
    const containerDefaultOptions = defaultOptions?.drawers?.container ?? {};
    const containerOptions = this.__DrawerGet(definition)?.containerOptions ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(containerDefaultOptions)(props), // navio.defaultOptions.tabs.container
      ...safeOpts(containerOptions)(props), // navio.stacks.[].containerOptions
    }); // must be function. merge options from buildNavio. also providing default options

    return <StackNavigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  private Drawer: React.FC<{
    drawerDef: TDrawerDefinition<DrawersName> | undefined;
  }> = ({drawerDef}) => {
    const {drawers, hooks} = this.layout;

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    if (!drawers) {
      this.log('No drawers registered');
      return <></>;
    }

    const currentDrawer: TDrawersData<ScreensName, StacksName, TabsName> | undefined =
      typeof drawerDef === 'string' ? drawers[drawerDef] : undefined;
    if (!currentDrawer) {
      this.log('No drawer found');
      return <></>;
    }

    // -- building navigator
    const Drawer = useMemo(() => createDrawerNavigator(), [drawers]);
    const currentDrawersContentKeys = useMemo(
      () => Object.keys(currentDrawer.content),
      [currentDrawer.content],
    );

    const DrawerScreensMemo = useMemo(() => {
      return currentDrawersContentKeys.map(key =>
        this.DrawerScreen({
          name: key,
          DrawerNavigator: Drawer,
          content: currentDrawer.content[key],
        }),
      );
    }, [Drawer, currentDrawersContentKeys]);

    return (
      <Drawer.Navigator {...currentDrawer.navigatorProps}>{DrawerScreensMemo}</Drawer.Navigator>
    );
  };

  private DrawerScreen: React.FC<{
    DrawerNavigator: ReturnType<typeof createDrawerNavigator>;
    name: string;
    content: TDrawerContentValue<ScreensName, StacksName, TabsName>;
  }> = ({DrawerNavigator, name, content}) => {
    const {defaultOptions} = this.layout;

    if (!content.stack && !content.tabs) {
      this.log(`Either 'stack' or 'tabs' must be provided for "${name}" drawer content.`);
      return null;
    }

    // component
    const C = () =>
      content.stack
        ? this.Stack({stackDef: content.stack})
        : content.tabs
        ? this.Tabs({tabsDef: content.tabs})
        : null;

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.drawers?.screen ?? {};
    const dcsDefaultOptions = defaultOptions?.drawers?.screen ?? {};
    const dcsOpts = content?.options ?? {};
    const Opts: BaseOptions<DrawerNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(dcsDefaultOptions)(props), // navio.defaultOptions.drawers.screen
      ...safeOpts(dcsOpts)(props), // drawer-based options
    }); // must be function. merge options from buildNavio. also providing default options

    // screen
    return <DrawerNavigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  // | Modals |
  private ModalContainer: React.FC<{
    StackNavigator: ReturnType<typeof createNativeStackNavigator>;
    name: ModalsName;
    definition: TStackDefinition<ScreensName, StacksName> | undefined;
  }> = ({StackNavigator, definition, name}) => {
    const {defaultOptions} = this.layout;

    // component
    const C = () => this.Stack({stackDef: definition});

    // options
    const customDefaultOptions = this.getCustomDefaultOptions()?.modals?.container ?? {};
    const containerDefaultOptions = defaultOptions?.modals?.container ?? {};
    const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
      ...safeOpts(customDefaultOptions)(props), // [!] custom default options
      ...safeOpts(containerDefaultOptions)(props), // navio.defaultOptions.tabs.container
    }); // must be function. merge options from buildNavio. also providing default options

    return <StackNavigator.Screen key={name} name={name} component={C} options={Opts} />;
  };

  /**
   * Generates `<Root />` component for provided layout. Returns Stack Navigator.
   */
  private Root: React.FC<RootProps<TRootName<StacksName, TabsName, DrawersName>>> = ({
    root: parentRoot,
  }) => {
    const {stacks, tabs, modals, drawers, root} = this.layout;
    const appRoot = parentRoot ?? root;
    const AppStack = createNativeStackNavigator();

    // Effects
    useEffect(() => {
      // -- changing route if `root` was changed
      if (parentRoot) {
        this.__setRoot(parentRoot);
      }
    }, [parentRoot]);

    // UI Methods
    // -- app stacks
    const AppStacks = useMemo(() => {
      if (!stacks) return null;

      const stacksKeys = Object.keys(stacks) as StacksName[];
      return stacksKeys.map(sk =>
        this.StackContainer({Stack: AppStack, name: sk, definition: stacks[sk]}),
      );
    }, [stacks]);

    // -- app tabs
    const AppTabs = useMemo(() => {
      if (!tabs) return null;

      const tabsKeys = Object.keys(tabs) as TabsName[];
      return tabsKeys.map(tk =>
        this.TabsContainer({StackNavigator: AppStack, name: tk, definition: tk}),
      );
    }, [tabs]);

    // -- app drawers
    const AppDrawers = useMemo(() => {
      if (!drawers) return null;

      const drawersKeys = Object.keys(drawers) as DrawersName[];
      return drawersKeys.map(dk =>
        this.DrawerContainer({StackNavigator: AppStack, name: dk, definition: dk}),
      );
    }, [drawers]);

    // -- app modals
    const AppModals = useMemo(() => {
      if (!modals) return null;

      const modalsKeys = Object.keys(modals) as ModalsName[];
      return modalsKeys.map(mk =>
        this.ModalContainer({StackNavigator: AppStack, name: mk, definition: modals[mk]}),
      );
    }, [modals]);

    // -- app root
    const AppRoot = useMemo(() => {
      return (
        <AppStack.Navigator initialRouteName={appRoot as string}>
          {/* Stacks */}
          <AppStack.Group>{AppStacks}</AppStack.Group>

          {/* Tabs */}
          <AppStack.Group>{AppTabs}</AppStack.Group>

          {/* Drawers */}
          <AppStack.Group>{AppDrawers}</AppStack.Group>

          {/* Modals */}
          <AppStack.Group screenOptions={{presentation: 'modal'}}>{AppModals}</AppStack.Group>
        </AppStack.Navigator>
      );
    }, [appRoot]);

    return AppRoot;
  };

  /**
   * Generates your app's root component for provided layout.
   * Can be used as `<AppProviders><navio.App /></AppProviders>`
   */
  App: React.FC<RootProps<TRootName<StacksName, TabsName, DrawersName>>> = ({
    navigationContainerProps,
    root: parentRoot,
  }) => {
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
