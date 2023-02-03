import React, {useEffect, useMemo} from 'react';
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
  TTabContentData,
  TDrawerContentData,
  RootSetAs,
  TTabsContentValue,
  TTabUpdatedOptions,
} from './types';

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
  TabsData extends TTabsData<ScreensName, StacksName>,
  ModalsData extends TModalData<ScreensName, StacksName>,
  DrawersData extends TDrawersData<ScreensName, StacksName>,
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
    TabsData extends TTabsData<ScreensName, StacksName>,
    ModalsData extends TModalData<ScreensName, StacksName>,
    DrawersData extends TDrawersData<ScreensName, StacksName>,
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
    if (this.layout.stacks && this.layout.stacks[routeName as StacksName]) {
      this.stacks.setRoot(routeName as StacksName);
    }
    if (this.layout.tabs && this.layout.tabs[routeName as TabsName]) {
      this.tabs.setRoot(routeName as TabsName);
    }
    if (this.layout.drawers && this.layout.drawers[routeName as DrawersName]) {
      this.drawers.setRoot(routeName as DrawersName);
    }
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
       * @param options `BaseOptions<BottomTabNavigationOptions>` options for the tab.
       */
      // updateOptions<T extends TabsContentName>(
      //   name: T,
      //   options: BaseOptions<BottomTabNavigationOptions>,
      // ) {
      //   if (self.navIsReady) {
      //   // self.emitter.emit('tabs.updateOptions', {name, options});
      //   // updateNavioState('tabUpdatedOptions', {name, options});
      //   }
      // },

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
    const navigatorProps = Array.isArray(stackDef)
      ? // if stackDef is ScreenName[]
        {}
      : // if stackDev is TStacksDataObj
      typeof stackDef === 'object'
      ? (stackDef as TStackDataObj<ScreensName>).navigatorProps ?? {}
      : // if stackDev is StacksName -> look into stacks[...]
      typeof stackDef === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[stackDef])
        ? {}
        : // if stacks[name] is TStacksDataObj
        typeof stacks[stackDef] === 'object'
        ? (stacks[stackDef] as TStackDataObj<ScreensName>).navigatorProps ?? {}
        : {}
      : {};

    // -- building navigator
    const Stack = createNativeStackNavigator();
    const StackScreensMemo = useMemo(() => {
      const screensKeys: ScreensName[] = Array.isArray(stackDef)
        ? // if stackDef is ScreenName[]
          stackDef
        : // if stackDef is TStacksDataObj
        typeof stackDef === 'object'
        ? (stackDef as TStackDataObj<ScreensName>).screens ?? []
        : // if stackDef is StacksName -> look into stacks[...]
        typeof stackDef === 'string'
        ? // if stacks[name] is ScreenName[]
          Array.isArray(stacks[stackDef])
          ? (stacks[stackDef] as ScreensName[])
          : // if stacks[name] is TStacksDataObj
          typeof stacks[stackDef] === 'object'
          ? (stacks[stackDef] as TStackDataObj<ScreensName>).screens ?? []
          : []
        : [];

      return screensKeys.map(sk => {
        const key = String(sk) as string;
        const screen = screens[key as ScreensName];

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
        const defaultOptions = this.layout.defaultOptions?.stack ?? {};
        const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
          // navio.defaultOptions.stack
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          // navio.screens.Name.options
          ...(typeof sOptions === 'function' ? sOptions(props) : sOptions),
          // component-based options
          ...(typeof C.options === 'function' ? C.options(props) : C.options),
        }); // must be function. merge options from buildNavio and from component itself. also providing default options

        // screen
        return <Stack.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, [stackDef, screens, stacks]);

    return <Stack.Navigator {...navigatorProps}>{StackScreensMemo}</Stack.Navigator>;
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

    const currentDrawer: TDrawersData<ScreensName, StacksName> | undefined =
      typeof drawerDef === 'string' ? drawers[drawerDef] : undefined;
    if (!currentDrawer) {
      this.log('No drawer found');
      return <></>;
    }

    // -- building navigator
    const Drawer = createDrawerNavigator();
    const DrawerScreensMemo = useMemo(() => {
      const dContent = currentDrawer.content;
      const dContentKeys: DrawersContentName[] = Object.keys(
        currentDrawer.content,
      ) as DrawersContentName[];
      return dContentKeys.map(dck => {
        const key = String(dck) as string; // drawer content key
        const dcs = dContent[key] as any; // drawer content stack definition
        const stackDef =
          typeof dcs === 'object' && dcs['stack']
            ? (dcs as TDrawerContentData<ScreensName, StacksName>).stack
            : (dcs as TStackDefinition<ScreensName, StacksName>);

        // component
        const C = () => this.Stack({stackDef});

        // options
        const defaultOptions = this.layout.defaultOptions?.drawer ?? {};
        const dcsOpts = dcs?.options ?? {};
        const Opts: BaseOptions<DrawerNavigationOptions> = props => ({
          // navio.defaultOptions.drawer
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          // drawer-based options
          ...(typeof dcsOpts === 'function' ? dcsOpts(props) : dcsOpts),
        }); // must be function. merge options from buildNavio. also providing default options

        // screen
        return <Drawer.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, []);

    return (
      <Drawer.Navigator {...currentDrawer.navigatorProps}>{DrawerScreensMemo}</Drawer.Navigator>
    );
  };

  private Tabs: React.FC<{
    tabsDef: TTabsDefinition<TabsName> | undefined;
  }> = ({tabsDef}) => {
    const {tabs, hooks} = this.layout;

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    if (!tabs) {
      this.log('No tabs registered');
      return <></>;
    }

    const currentTabs: TTabsData<ScreensName, StacksName> | undefined =
      typeof tabsDef === 'string' ? tabs[tabsDef] : undefined;
    if (!currentTabs) {
      this.log('No tabs found');
      return <></>;
    }

    // -- building navigator
    const Tabs = createBottomTabNavigator();
    const currentTabsContentKeys = useMemo(
      () => Object.keys(currentTabs.content),
      [currentTabs.content],
    );

    const TabScreensMemo = useMemo(() => {
      return currentTabsContentKeys.map(key =>
        this.TabsScreen({
          key,
          Navigator: Tabs,
          content: currentTabs.content[key],
        }),
      );
    }, [currentTabsContentKeys]);

    return <Tabs.Navigator {...currentTabs.navigatorProps}>{TabScreensMemo}</Tabs.Navigator>;
  };

  private TabsScreen: React.FC<{
    Navigator: ReturnType<typeof createBottomTabNavigator>;
    key: string;
    content: TTabsContentValue<ScreensName, StacksName>;
  }> = ({Navigator, key, content}) => {
    const {defaultOptions} = this.layout;

    const tcs = content as any;
    const stackDef =
      typeof tcs === 'object' && tcs['stack']
        ? (tcs as TTabContentData<ScreensName, StacksName>).stack
        : (tcs as TStackDefinition<ScreensName, StacksName>);

    // component
    const C = () => this.Stack({stackDef});

    // options
    const defaultOpts = defaultOptions?.tab ?? {};
    const tcsOpts = tcs?.options ?? {};
    const Opts: BaseOptions<BottomTabNavigationOptions> = props => ({
      // navio.defaultOptions.tab
      ...(typeof defaultOpts === 'function' ? defaultOpts(props) : defaultOpts),
      // tab-based options
      ...(typeof tcsOpts === 'function' ? tcsOpts(props) : tcsOpts),
    }); // must be function. merge options from buildNavio. also providing default options

    return <Navigator.Screen key={key} name={key} component={C} options={Opts} />;
  };

  /**
   * Generates `<Root />` component for provided layout. On top of `<NavigationContainer />`.
   * Can be used as `<AppProviders><navio.Root /></AppProviders>`
   */
  Root: React.FC<RootProps<TRootName<StacksName, TabsName, DrawersName>>> = ({
    navigationContainerProps,
    initialRouteName,
  }) => {
    const {screens, stacks, tabs, modals, drawers, root} = this.layout;
    const appRoot = initialRouteName ?? root;
    const RootStack = createNativeStackNavigator();

    // Effects
    useEffect(() => {
      // -- changing route if `initialRouteName` was changed
      if (initialRouteName) {
        this.__setRoot(initialRouteName);
      }
    }, [initialRouteName]);

    // Internal methods
    const _navContainerRef = (instance: NavigationContainerRef<{}> | null) => {
      this.navRef.current = instance;
    };

    const _navContainerOnReady = () => {
      this.navIsReadyRef.current = true;

      if (navigationContainerProps?.onReady) {
        navigationContainerProps?.onReady();
      }
    };

    // UI Methods
    // -- generating stacks
    const StacksMemo = useMemo(() => {
      if (!stacks) return null;

      const stacksKeys = Object.keys(stacks);
      return stacksKeys.map(sk => {
        const key = String(sk) as string;
        const C = () => this.Stack({stackDef: stacks[sk as StacksName]});
        return <RootStack.Screen key={key} name={key} component={C} />;
      });
    }, [stacks]);

    // -- generating tabs
    const TabsMemo = useMemo(() => {
      if (!tabs) return null;

      const tabsKeys = Object.keys(tabs);
      return tabsKeys.map(dk => {
        const key = String(dk) as string;
        const C = () => this.Tabs({tabsDef: dk as TabsName});
        return <RootStack.Screen key={key} name={key} component={C} />;
      });
    }, [tabs]);

    // -- generating modals
    const ModalsMemo = useMemo(() => {
      if (!modals) return null;

      const modalsKeys = Object.keys(modals);
      return modalsKeys.map(mk => {
        const key = String(mk) as string;
        const C = () => this.Stack({stackDef: modals[mk as ModalsName]});
        return <RootStack.Screen key={key} name={key} component={C} />;
      });
    }, [modals]);

    // -- generating drawers
    const DrawersMemo = useMemo(() => {
      if (!drawers) return null;

      const drawersKeys = Object.keys(drawers);
      return drawersKeys.map(dk => {
        const key = String(dk) as string;
        const C = () => this.Drawer({drawerDef: dk as DrawersName});
        return <RootStack.Screen key={key} name={key} component={C} />;
      });
    }, [drawers]);

    // -- generating fake stack (if none [stacks, tabs, drawers] is provided)
    const FakeStackMemo = useMemo(() => {
      const fakeStackKeys = Object.keys(screens ?? {}) as ScreensName[];
      const C = () => {
        if (fakeStackKeys.length > 0) {
          return this.Stack({stackDef: fakeStackKeys});
        }

        this.log('No screens registered', 'warn');
        return <></>;
      };

      return <RootStack.Screen key={'Stack'} name={'Stack'} component={C} />;
    }, [screens]);

    // -- generating app's screens
    const AppScreensMemo = useMemo(() => {
      if (!TabsMemo && !StacksMemo && !DrawersMemo) return FakeStackMemo;

      return [TabsMemo, StacksMemo, DrawersMemo];
    }, [TabsMemo, StacksMemo, DrawersMemo, FakeStackMemo]);

    // -- building root
    const RootMemo = useMemo(() => {
      return (
        <RootStack.Navigator
          initialRouteName={appRoot as string}
          screenOptions={{headerShown: false}}
        >
          {/* Tabs, Stacks, Drawers */}
          <RootStack.Group>{AppScreensMemo}</RootStack.Group>

          {/* Modals */}
          <RootStack.Group screenOptions={{presentation: 'modal'}}>{ModalsMemo}</RootStack.Group>
        </RootStack.Navigator>
      );
    }, [appRoot, AppScreensMemo, ModalsMemo]);

    return (
      <NavigationContainer
        {...navigationContainerProps}
        ref={_navContainerRef}
        onReady={_navContainerOnReady}
      >
        {RootMemo}
      </NavigationContainer>
    );
  };
}
