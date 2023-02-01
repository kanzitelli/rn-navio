import {
  NavigationContainerRefWithCurrent,
  createNavigationContainerRef,
  CommonActions,
  StackActions,
  TabActions,
  DrawerActions,
} from '@react-navigation/native';
import React from 'react';
import {Keys, TDrawerData, TModalData, TRootName, TScreenData, TStackData, TTabData} from './types';

export class NavioNavigation<
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
    T extends ScreenName | StackName | TabName | ModalName,
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
   * `setRoot(...)` action sets a new root of the app.
   *
   * Tips: It can be used to switch between Auth and App stacks.
   *
   * @param name 'Tabs' | StackName | DrawerName
   */
  setRoot<T extends RootName>(name: T) {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(
        CommonActions.reset({
          routes: [{name}],
        }),
      );
    }
  }

  /**
   * `setParams(...)` action allows to update params for a certain route.
   *
   * @param name all available navigation keys. Leave `undefined` if applying for the focused route.
   * @param params object
   */
  setParams<T extends string>(name: T, params: object) {
    // TODO think about how to take all names and not getting plain string when some name is not defined
    if (this.navIsReady) {
      this.navRef.current?.dispatch({
        ...CommonActions.setParams(params),
        source: name as string,
      });
    }
  }

  /**
   * `stack` contains navigation actions for stack-based navigators.
   *
   * Available methods:
   *
   * `push`, `pop`, `popToTop`
   *
   */
  get stack() {
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
    };
  }

  /**
   * `tab` contains navigation actions for tab-based navigators.
   *
   * Available methods:
   *
   * `jumpTo`
   *
   */
  get tab() {
    // local copy of current instance
    const self = this;

    return {
      /**
       * `jumpTo(...)` action can be used to jump to an existing route in the tab navigator.
       *
       * @param name TabName
       */
      jumpTo<T extends TabName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(TabActions.jumpTo(name as string));
        }
      },
    };
  }

  /**
   * `modal` contains navigation actions for modals.
   *
   * Available methods:
   *
   * `show`
   *
   */
  get modal() {
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
   * `drawer` contains navigation actions for drawer-based navigators.
   *
   * Available methods:
   *
   * `open`, `close`, `toggle`, `jumpTo`
   *
   */
  get drawer() {
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
       * @param name StackName
       */
      jumpTo<T extends DrawerContentName>(name: T) {
        if (self.navIsReady) {
          self.navRef.current?.dispatch(DrawerActions.jumpTo(name as string));
        }
      },
    };
  }
}
