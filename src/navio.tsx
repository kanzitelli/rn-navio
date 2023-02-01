import {createBottomTabNavigator, BottomTabNavigationOptions} from '@react-navigation/bottom-tabs';
import {NavigationContainer, NavigationContainerRef} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
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
} from './types';

// Navio navigation

export class Navio<
  ScreenName extends string,
  StackName extends string,
  TabName extends string,
  ModalName extends string,
  //
  ScreenData extends TScreenData,
  StackData extends TStackData<ScreenName>,
  TabData extends TTabData<ScreenName, StackName>,
  ModalData extends TModalData<ScreenName, StackName>,
  //
  RootName extends TRootName<StackName> = TRootName<StackName>,
> extends NavioNavigation<ScreenName, StackName, TabName, ModalName, RootName> {
  static build<
    ScreenName extends string,
    StackName extends string,
    TabName extends string,
    ModalName extends string,
    //
    ScreenData extends TScreenData,
    StackData extends TStackData<ScreenName>,
    TabData extends TTabData<ScreenName, StackName>,
    ModalData extends TModalData<ScreenName, StackName>,
    //
    RootName extends TRootName<StackName> = TRootName<StackName>,
  >(
    data: Layout<
      Record<ScreenName, ScreenData>,
      Record<StackName, StackData>,
      Record<TabName, TabData>,
      Record<ModalName, ModalData>,
      RootName
    >,
  ) {
    const _navio = new Navio<
      ScreenName,
      StackName,
      TabName,
      ModalName,
      ScreenData,
      StackData,
      TabData,
      ModalData
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
    const StacksLayoutMemo = useMemo(() => {
      if (!screens || !stacks) return null;

      // const screens2: ScreenName[] =
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
        const defaultOptions = this.layout.options?.stack ?? {};
        const Opts: BaseOptions<NativeStackNavigationOptions> = props => ({
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          ...(typeof sOptions === 'function' ? sOptions(props) : sOptions),
          ...(typeof C.options === 'function' ? C.options(props) : C.options),
        }); // must be function. merge options from buildNavio and from component itself. also providing default options
        return <Stack.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, [stackDef, screens, stacks]);

    return <Stack.Navigator>{StacksLayoutMemo}</Stack.Navigator>;
  };

  // private Drawer: React.FC = () => {
  //   const {drawer, hooks} = this.layout;
  //   if (!drawer) {
  //     this.log('No drawer registered');
  //     return <></>;
  //   }

  //   // -- running hooks
  //   if (hooks) for (const h of hooks) if (h) h();

  //   // -- building navigator
  //   const Drawer = createDrawerNavigator();
  //   const DrawerLayoutMemo = useMemo(() => {
  //     return <></>;
  //   }, []);

  //   return <Drawer.Navigator>{DrawerLayoutMemo}</Drawer.Navigator>;
  // };

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
    const TabsLayoutMemo = useMemo(() => {
      const tabsKeys = Object.keys(tabs);
      return tabsKeys.map(tk => {
        const key = String(tk) as string;
        const t = tabs[key as TabName];
        const C = () => this.Stack({stackDef: t.stack});
        const defaultOptions = this.layout.options?.tab ?? {};
        const Opts: BaseOptions<BottomTabNavigationOptions> = props => ({
          ...(typeof defaultOptions === 'function' ? defaultOptions(props) : defaultOptions),
          ...(typeof t.options === 'function' ? t.options(props) : t.options),
        }); // must be function. merge options from buildNavio. also providing default options
        return <Tabs.Screen key={key} name={key} component={C} options={Opts} />;
      });
    }, [tabs]);

    return <Tabs.Navigator>{TabsLayoutMemo}</Tabs.Navigator>;
  };

  /**
   * Generates `<Root />` component for provided layout. On top of `<NavigationContainer />`.
   * Can be used as `<AppProviders><navio.Root /></AppProviders>`
   */
  Root: React.FC<RootProps<RootName>> = ({navigationContainerProps, initialRouteName, extend}) => {
    const {screens, stacks, tabs, modals, root} = this.layout;
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
    const ExtendMemo = useMemo(() => {
      const C = () => {
        if (!extend) return null;
        return extend;
      };
      return <RootStack.Screen key={'Extend'} name={'Extend'} component={C} />;
    }, [extend]);
    const AppScreensMemo = useMemo(() => {
      if (!TabsMemo && !StacksMemo) return FakeStackMemo;

      return [TabsMemo, StacksMemo];
    }, [TabsMemo, StacksMemo, FakeStackMemo]);

    // -- building root
    const RootMemo = useMemo(() => {
      return (
        <RootStack.Navigator
          initialRouteName={appRoot as string}
          screenOptions={{headerShown: false}}
        >
          {/* Tabs and Stacks */}
          <RootStack.Group>{[AppScreensMemo, ExtendMemo]}</RootStack.Group>

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
