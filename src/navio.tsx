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
  TTabData,
  TModalData,
  TRootName,
  Layout,
  TStack,
  NavioScreen,
  BaseOptions,
  ExtractProps,
  RootProps,
  TStackDataObj,
  TDrawerData,
  TDrawer,
  Keys,
} from './types';

// Navio navigation

export class Navio<
  ScreenName extends string,
  StackName extends string,
  TabName extends string,
  ModalName extends string,
  DrawerName extends string,
  DrawerContentName extends Keys<DrawerData['content']>,
  //
  ScreenData extends TScreenData,
  StackData extends TStackData<ScreenName>,
  TabData extends TTabData<ScreenName, StackName>,
  ModalData extends TModalData<ScreenName, StackName>,
  DrawerData extends TDrawerData<ScreenName, StackName>,
  //
  RootName extends TRootName<StackName, DrawerName> = TRootName<StackName, DrawerName>,
> extends NavioNavigation<
  ScreenName,
  StackName,
  TabName,
  ModalName,
  DrawerName,
  DrawerContentName,
  ScreenData,
  StackData,
  TabData,
  ModalData,
  DrawerData,
  RootName
> {
  static build<
    ScreenName extends string,
    StackName extends string,
    TabName extends string,
    ModalName extends string,
    DrawerName extends string,
    DrawerContentName extends Keys<DrawerData['content']>,
    //
    ScreenData extends TScreenData,
    StackData extends TStackData<ScreenName>,
    TabData extends TTabData<ScreenName, StackName>,
    ModalData extends TModalData<ScreenName, StackName>,
    DrawerData extends TDrawerData<ScreenName, StackName>,
    //
    RootName extends TRootName<StackName, DrawerName> = TRootName<StackName, DrawerName>,
  >(
    data: Layout<
      Record<ScreenName, ScreenData>,
      Record<StackName, StackData>,
      Record<TabName, TabData>,
      Record<ModalName, ModalData>,
      Record<DrawerName, DrawerData>,
      RootName
    >,
  ) {
    const _navio = new Navio<
      ScreenName,
      StackName,
      TabName,
      ModalName,
      DrawerName,
      DrawerContentName,
      ScreenData,
      StackData,
      TabData,
      ModalData,
      DrawerData
    >(data);
    return _navio;
  }

  // ========
  // | Vars |
  // ========
  private layout: Layout<
    Record<ScreenName, ScreenData>,
    Record<StackName, StackData>,
    Record<TabName, TabData>,
    Record<ModalName, ModalData>,
    Record<DrawerName, DrawerData>,
    RootName
  >;

  // ========
  // | Init |
  // ========
  constructor(
    data: Layout<
      Record<ScreenName, ScreenData>,
      Record<StackName, StackData>,
      Record<TabName, TabData>,
      Record<ModalName, ModalData>,
      Record<DrawerName, DrawerData>,
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
    stackDef: TStack<ScreenName, StackName> | undefined;
  }> = ({stackDef}) => {
    if (!stackDef) return null;
    const {screens, stacks, hooks} = this.layout;

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Stack = createNativeStackNavigator();
    const StackScreensMemo = useMemo(() => {
      if (!screens || !stacks) return null;

      const screensKeys: ScreenName[] = Array.isArray(stackDef)
        ? stackDef
        : typeof stackDef === 'string'
        ? typeof stacks[stackDef] === 'object'
          ? (stacks[stackDef] as TStackDataObj<ScreenName>).screens
          : []
        : [];
      return screensKeys.map(sk => {
        const key = String(sk) as string;
        const s = screens[key as ScreenName];

        // component
        // -- handling when screen is a component or object{component,options}
        let sComponent: NavioScreen;
        let sOptions: BaseOptions<NativeStackNavigationOptions>;
        if (typeof s === 'object') {
          if (s.component) {
            // {component,options}
            sComponent = s.component;
            sOptions = s.options ?? {};
          } else {
            // component
            // this might happen if a screen is provided as wrapped component, for ex. const Main: React.FC = observer(() => {}); (observer from mobx)
            sComponent = s as any;
            sOptions = {};
          }
        } else {
          // component
          sComponent = s;
          sOptions = {};
        }
        const C = sComponent;

        // options
        const defaultOptions = this.layout.defaultOptions?.stack ?? {};
        const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
          // navio.defaultOptions
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          // navio.screens.[].options
          ...(typeof sOptions === 'function' ? sOptions(props) : sOptions),
          // component-based options
          ...(typeof C.options === 'function' ? C.options(props) : C.options),
        }); // must be function. merge options from buildNavio and from component itself. also providing default options

        // screen
        return <Stack.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, [stackDef, screens, stacks]);

    return <Stack.Navigator>{StackScreensMemo}</Stack.Navigator>;
  };

  private Drawer: React.FC<{
    drawerDef: TDrawer<DrawerName> | undefined;
  }> = ({drawerDef}) => {
    const {drawers, hooks} = this.layout;
    if (!drawers) {
      this.log('No drawers registered');
      return <></>;
    }

    const drawer: TDrawerData<ScreenName, StackName> | undefined =
      typeof drawerDef === 'string' ? drawers[drawerDef] : undefined;
    if (!drawer) {
      this.log('No drawer found');
      return <></>;
    }

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Drawer = createDrawerNavigator();
    const DrawerScreensMemo = useMemo(() => {
      const dContent = drawer.content;
      const dContentKeys: DrawerContentName[] = Object.keys(drawer.content) as DrawerContentName[];
      return dContentKeys.map(dck => {
        const key = String(dck) as string; // drawer content key
        const dcsDef = dContent[key]; // drawer content stack definition

        // component
        const C = () => this.Stack({stackDef: dcsDef});

        // options
        const defaultOptions = this.layout.defaultOptions?.drawer ?? {};
        const Opts: BaseOptions<DrawerNavigationOptions> = props => ({
          // navio.defaultOptions
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          // navio.drawers.[].options
          ...(typeof drawer.options === 'function' ? drawer.options(props) : drawer.options),
        }); // must be function. merge options from buildNavio. also providing default options

        // screen
        return <Drawer.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, []);

    return <Drawer.Navigator>{DrawerScreensMemo}</Drawer.Navigator>;
  };

  private Tabs: React.FC = () => {
    const {tabs, hooks} = this.layout;
    if (!tabs) {
      this.log('No tabs registered');
      return <></>;
    }

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Tabs = createBottomTabNavigator();
    const TabsScreensMemo = useMemo(() => {
      const tabsKeys = Object.keys(tabs);
      return tabsKeys.map(tk => {
        const key = String(tk) as string;
        const t = tabs[key as TabName];
        // component
        const C = () => this.Stack({stackDef: t.stack});

        // options
        const defaultOptions = this.layout.defaultOptions?.tab ?? {};
        const Opts: BaseOptions<BottomTabNavigationOptions> = props => ({
          // navio.defaultOptions
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          // navio.tabs.[].options
          ...(typeof t.options === 'function' ? t.options(props) : t.options),
        }); // must be function. merge options from buildNavio. also providing default options

        // screen
        return <Tabs.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, [tabs]);

    return <Tabs.Navigator>{TabsScreensMemo}</Tabs.Navigator>;
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
      // if `initialRouteName` is changed, we need to set new root
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

      const C = () => this.Tabs({});
      return <RootStack.Screen key={'Tabs'} name={'Tabs'} component={C} />;
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
        const C = () => this.Drawer({drawerDef: dk as DrawerName});
        return <RootStack.Screen key={key} name={key} component={C} />;
      });
    }, [drawers]);

    // -- generating fake stack (if none [stacks, tabs] is provided)
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
    // const ExtendMemo = useMemo(() => {
    //   const C = () => {
    //     if (!extend) return null;
    //     return extend;
    //   };
    //   return <RootStack.Screen key={'Extend'} name={'Extend'} component={C} />;
    // }, [extend]);
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
          {/* Tabs and Stacks */}
          <RootStack.Group>{[AppScreensMemo]}</RootStack.Group>

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
