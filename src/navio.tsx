import {createBottomTabNavigator, BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {createDrawerNavigator, DrawerNavigationOptions} from '@react-navigation/drawer';
import React, {useEffect, useMemo} from 'react';
import {NavioNavigation} from './navio-navigation';
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
} from './types';

export class Navio<
  ScreenName extends string,
  StackName extends string,
  TabsName extends string,
  ModalName extends string,
  DrawersName extends string,
  //
  ScreenData extends TScreenData,
  StackData extends TStackData<ScreenName>,
  TabsData extends TTabsData<ScreenName, StackName>,
  ModalData extends TModalData<ScreenName, StackName>,
  DrawersData extends TDrawersData<ScreenName, StackName>,
  //
  TabsContentName extends ContentKeys<TabsData> = ContentKeys<TabsData>,
  DrawersContentName extends ContentKeys<DrawersData> = ContentKeys<DrawersData>,
  RootName extends TRootName<StackName, TabsName, DrawersName> = TRootName<
    StackName,
    TabsName,
    DrawersName
  >,
> extends NavioNavigation<
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
  TabsContentName,
  DrawersContentName,
  RootName
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
    TabsData extends TTabsData<ScreenName, StackName>,
    ModalData extends TModalData<ScreenName, StackName>,
    DrawersData extends TDrawersData<ScreenName, StackName>,
    //
    TabsContentName extends ContentKeys<TabsData> = ContentKeys<TabsData>,
    DrawersContentName extends ContentKeys<DrawersData> = ContentKeys<DrawersData>,
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
    Record<ScreenName, ScreenData>,
    Record<StackName, StackData>,
    Record<TabsName, TabsData>,
    Record<ModalName, ModalData>,
    Record<DrawersName, DrawersData>,
    RootName
  >;

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
    super();

    this.layout = data;
  }

  // ===========
  // | Layouts |
  // ===========
  private Stack: React.FC<{
    stackDef: TStackDefinition<ScreenName, StackName> | undefined;
  }> = ({stackDef}) => {
    if (!stackDef) return null;
    const {screens, stacks, hooks} = this.layout;

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
      : // if stackDev is TStackDataObj
      typeof stackDef === 'object'
      ? (stackDef as TStackDataObj<ScreenName>).navigatorProps ?? {}
      : // if stackDev is StackName -> look into stacks[...]
      typeof stackDef === 'string'
      ? // if stacks[name] is ScreenName[]
        Array.isArray(stacks[stackDef])
        ? {}
        : // if stacks[name] is TStackDataObj
        typeof stacks[stackDef] === 'object'
        ? (stacks[stackDef] as TStackDataObj<ScreenName>).navigatorProps ?? {}
        : {}
      : {};

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Stack = createNativeStackNavigator();
    const StackScreensMemo = useMemo(() => {
      const screensKeys: ScreenName[] = Array.isArray(stackDef)
        ? // if stackDef is ScreenName[]
          stackDef
        : // if stackDev is TStackDataObj
        typeof stackDef === 'object'
        ? (stackDef as TStackDataObj<ScreenName>).screens ?? []
        : // if stackDev is StackName -> look into stacks[...]
        typeof stackDef === 'string'
        ? // if stacks[name] is ScreenName[]
          Array.isArray(stacks[stackDef])
          ? (stacks[stackDef] as ScreenName[])
          : // if stacks[name] is TStackDataObj
          typeof stacks[stackDef] === 'object'
          ? (stacks[stackDef] as TStackDataObj<ScreenName>).screens ?? []
          : []
        : [];

      return screensKeys.map(sk => {
        const key = String(sk) as string;
        const screen = screens[key as ScreenName];

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
    if (!drawers) {
      this.log('No drawers registered');
      return <></>;
    }

    const currentDrawer: TDrawersData<ScreenName, StackName> | undefined =
      typeof drawerDef === 'string' ? drawers[drawerDef] : undefined;
    if (!currentDrawer) {
      this.log('No drawer found');
      return <></>;
    }

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

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
          typeof dcs === 'object' && dcs['content']
            ? (dcs as TDrawerContentData<ScreenName, StackName>).stack
            : (dcs as TStackDefinition<ScreenName, StackName>);

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
    const {tabs, hooks, defaultOptions} = this.layout;
    if (!tabs) {
      this.log('No tabs registered');
      return <></>;
    }

    const currentTabs: TTabsData<ScreenName, StackName> | undefined =
      typeof tabsDef === 'string' ? tabs[tabsDef] : undefined;
    if (!currentTabs) {
      this.log('No tabs found');
      return <></>;
    }

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Tabs = createBottomTabNavigator();
    const TabsScreensMemo = useMemo(() => {
      const tContent = currentTabs.content;
      const tContentKeys: TabsContentName[] = Object.keys(currentTabs.content) as TabsContentName[];
      return tContentKeys.map(tck => {
        const key = String(tck) as string; // tabs content key
        const tcs = tContent[key] as any; // tabs content stack definition
        const stackDef =
          typeof tcs === 'object' && tcs['content']
            ? (tcs as TTabContentData<ScreenName, StackName>).stack
            : (tcs as TStackDefinition<ScreenName, StackName>);

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

        // screen
        return <Tabs.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, [tabs, currentTabs]);

    return <Tabs.Navigator {...currentTabs.navigatorProps}>{TabsScreensMemo}</Tabs.Navigator>;
  };

  /**
   * Generates `<Root />` component for provided layout. On top of `<NavigationContainer />`.
   * Can be used as `<AppProviders><navio.Root /></AppProviders>`
   */
  Root: React.FC<RootProps<RootName>> = ({navigationContainerProps, initialRouteName}) => {
    const {screens, stacks, tabs, modals, drawers, root} = this.layout;
    const appRoot = initialRouteName ?? root;
    const RootStack = createNativeStackNavigator();

    // Effects
    useEffect(() => {
      // if `initialRouteName` is changed, we set new root
      if (initialRouteName) {
        this.setRoot(initialRouteName);
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
        const C = () => this.Stack({stackDef: stacks[sk as StackName]});
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
        const C = () => this.Stack({stackDef: modals[mk as ModalName]});
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
      const fakeStackKeys = Object.keys(screens ?? {}) as ScreenName[];
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

  // System
  private log(message: string, type: 'log' | 'warn' | 'error' = 'log') {
    console[type](`[navio] ${message}`);
  }
}
