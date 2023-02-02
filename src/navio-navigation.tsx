import {
  NavigationContainerRefWithCurrent,
  createNavigationContainerRef,
  CommonActions,
  StackActions,
  TabActions,
  DrawerActions,
} from '@react-navigation/native';
import React from 'react';
import {
  ContentKeys,
  TDrawersData,
  TModalData,
  TRootName,
  TScreenData,
  TStackData,
  TTabsData,
} from './types';

export class NavioNavigation<
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
> {
  protected navRef: NavigationContainerRefWithCurrent<any>;
  protected navIsReadyRef: React.MutableRefObject<boolean | null>;

  constructor() {
    this.navRef = createNavigationContainerRef<any>();
    this.navIsReadyRef = React.createRef<boolean>();
  }

  // ===========
  // | Getters |
  // ===========
  get N() {
    return this.navRef;
  }

  protected get navIsReady() {
    return (
      !!this.navIsReadyRef && this.navIsReadyRef.current && !!this.navRef && !!this.navRef.current
    );
  }

  // ===========
  // | Methods |
  // ===========
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
}
