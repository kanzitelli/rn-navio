import React, {PropsWithChildren, useMemo} from 'react';
import {BottomTabNavigationOptions, createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {
  CommonActions,
  createNavigationContainerRef,
  NavigationContainer,
  NavigationContainerRef,
  NavigationContainerRefWithCurrent,
  ParamListBase,
  RouteProp,
  StackActions,
  TabActions,
} from '@react-navigation/native';

// =========
// | Types |
// =========
type BaseOptions<Return = NativeStackNavigationOptions> =
  | Return
  | ((props?: {route?: RouteProp<ParamListBase, string>; navigation?: any}) => Return);
type TScreenData<Props = {}> =
  | NavioScreen<Props>
  | {
      component: NavioScreen<Props>;
      options?: BaseOptions<NativeStackNavigationOptions>;
    };
type TStackData<ScreenName> = ScreenName[];
type TStackDef<StackName, ScreenName> = StackName | ScreenName[];
type TTabData<ScreenName, StackName> = {
  stack?: TStackDef<StackName, ScreenName>;
  options?: BaseOptions<BottomTabNavigationOptions>;
};
type TModalData<ScreenName, StackName> = TStackDef<StackName, ScreenName>;
type TRootName<T> = 'Tabs' | T;
type ExtractProps<Type> = Type extends React.FC<infer X> ? X : never;

type Layout<Screens = any, Stacks = any, Tabs = any, Modals = any, RootName = any> = {
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
   * Tabs of the app. Navigate to by using `navio.jumpTo('...Tab')` method.
   */
  tabs?: Tabs;

  /**
   * `(optional)`
   * Modals of the app. Navigate to by using `navio.show('...Modal')` method.
   */
  modals?: Modals;

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
   * Default options to be applied per each stack's screens or tab generated within the app layout.
   */
  options?: {
    stack?: BaseOptions<NativeStackNavigationOptions>;
    tab?: BaseOptions<BottomTabNavigationOptions>;
  };
};
export type NavioScreen<Props = {}> = React.FC<PropsWithChildren<Props>> & {
  options?: BaseOptions<NativeStackNavigationOptions>;
};

// =========
// | NAVIO |
// =========
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
> {
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
  private navRef: NavigationContainerRefWithCurrent<any>;
  private navIsReadyRef: React.MutableRefObject<boolean | null>;

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
    this.layout = data;

    // -- navigation setup
    this.navRef = createNavigationContainerRef<any>();
    this.navIsReadyRef = React.createRef<boolean>();
  }

  // ===========
  // | Getters |
  // ===========
  get N() {
    return this.navRef;
  }

  private get isNavReady() {
    return (
      !!this.navIsReadyRef && this.navIsReadyRef.current && !!this.navRef && !!this.navRef.current
    );
  }

  // ===========
  // | Layouts |
  // ===========
  private Stack: React.FC<{
    stackDef: TStackDef<StackName, ScreenName> | undefined;
  }> = ({stackDef}) => {
    if (!stackDef) return null;
    const {screens, stacks, hooks} = this.layout;

    // -- running hooks
    if (hooks) for (const h of hooks) if (h) h();

    // -- building navigator
    const Stack = createNativeStackNavigator();
    const StacksLayoutMemo = useMemo(() => {
      if (!screens) return null;

      const screensKeys: ScreenName[] = Array.isArray(stackDef)
        ? stackDef
        : stacks
        ? stacks[stackDef]
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
   * Generates <Root /> component for provided layout. On top of <NavigationContainer />
   */
  Root: React.FC<{
    navigationContainerProps?: Omit<ExtractProps<typeof NavigationContainer>, 'children'>;
    initialRouteName?: RootName;
  }> = ({navigationContainerProps, initialRouteName}) => {
    const {screens, stacks, tabs, modals, root} = this.layout;
    const appRoot = initialRouteName ?? root;
    const RootStack = createNativeStackNavigator();

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
      return [<RootStack.Screen key={'Tabs'} name={'Tabs'} component={C} />];
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

        this.log('No screens registered');
        return <></>;
      };

      return <RootStack.Screen key={'Stack'} name={'Stack'} component={C} />;
    }, [screens]);

    // -- generating app's screens
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

  // ===========
  // | Actions |
  // ===========
  /**
   * `push(...)` is used to navigate to a new screen in the stack.
   *
   * @param name ScreenName
   * @param props Props
   */
  push<T extends ScreenName, Props extends object | undefined>(name: T, props?: Props) {
    if (this.isNavReady) {
      this.navRef.current?.dispatch(StackActions.push(name as string, props));
    }
  }

  /**
   * `pushStack(...)` is used to navigate to a new stack. It will "hide" tabs.
   *
   * @param name StackName
   */
  pushStack<T extends StackName>(name: T) {
    if (this.isNavReady) {
      this.navigate(name);
    }
  }

  /**
   * `goBack()` is used to navigate back in the stack.
   */
  goBack() {
    if (this.isNavReady) {
      this.navRef.current?.goBack();
    }
  }

  /**
   * `pop(...)` is used to navigate to a previous screen in the stack.
   *
   * @param count number
   */
  pop(count?: number) {
    if (this.isNavReady) {
      this.navRef.current?.dispatch(StackActions.pop(count));
    }
  }

  /**
   * `popToPop()` is used to navigate to the first screen in the stack, dismissing all others.
   */
  popToTop() {
    if (this.isNavReady) {
      this.navRef.current?.dispatch(StackActions.popToTop());
    }
  }

  /**
   * `show(...)` is used to show a modal.
   *
   * @param name ModalName
   */
  show<T extends ModalName>(name: T) {
    if (this.isNavReady) {
      this.navigate(name);
    }
  }

  /**
   * `jumpTo(...)` is used to change the current tab.
   *
   * @param name TabName
   */
  jumpTo<T extends TabName>(name: T) {
    if (this.isNavReady) {
      this.navRef.current?.dispatch(TabActions.jumpTo(name as string));
    }
  }

  /**
   * `setRoot(...)` is used to set a new root of the app. It can be used to switch Auth and App stacks.
   *
   * @param name 'Tabs' | StackName
   */
  setRoot<T extends RootName>(name: T) {
    if (this.isNavReady) {
      this.navRef.current?.dispatch(
        CommonActions.reset({
          routes: [{name}],
        }),
      );
    }
  }

  private navigate = <
    T extends ScreenName | StackName | TabName | ModalName,
    Props extends object | undefined,
  >(
    name: T,
    props?: Props,
  ): void => {
    if (this.isNavReady) {
      this.navRef.current?.dispatch(
        CommonActions.navigate({
          name: name as string,
          params: props,
        }),
      );
    }
  };

  // System
  private log(message: string, type: 'log' | 'warn' | 'error' = 'log') {
    console[type](`[navio] ${message}`);
  }
}
