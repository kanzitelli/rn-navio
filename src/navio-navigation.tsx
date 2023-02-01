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
    Props extends object | undefined,
  >(
    name: T,
    props?: Props,
  ): void => {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(
        CommonActions.navigate({
          name: name as string,
          params: props,
        }),
      );
    }
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
    if (this.navIsReady) {
      this.navRef.current?.dispatch(StackActions.push(name as string, props));
    }
  }

  /**
   * `pushStack(...)` is used to navigate to a new stack. It will "hide" tabs.
   *
   * @param name StackName
   */
  pushStack<T extends StackName>(name: T) {
    if (this.navIsReady) {
      this.navigate(name);
    }
  }

  /**
   * `goBack()` is used to navigate back in the stack.
   */
  goBack() {
    if (this.navIsReady) {
      this.navRef.current?.goBack();
    }
  }

  /**
   * `pop(...)` is used to navigate to a previous screen in the stack.
   *
   * @param count number
   */
  pop(count?: number) {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(StackActions.pop(count));
    }
  }

  /**
   * `popToPop()` is used to navigate to the first screen in the stack, dismissing all others.
   */
  popToTop() {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(StackActions.popToTop());
    }
  }

  /**
   * `show(...)` is used to show a modal.
   *
   * @param name ModalName
   */
  show<T extends ModalName>(name: T) {
    if (this.navIsReady) {
      this.navigate(name);
    }
  }

  /**
   * `jumpTo(...)` is used to change the current tab.
   *
   * @param name TabName
   */
  jumpTo<T extends TabName>(name: T) {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(TabActions.jumpTo(name as string));
    }
  }

  /**
   * `setRoot(...)` is used to set a new root of the app. It can be used to switch between Auth and App stacks.
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

  drawerJumpTo<T extends DrawerContentName>(name: T) {
    if (this.navIsReady) {
      this.navRef.current?.dispatch(DrawerActions.jumpTo(name as string));
    }
  }
}
