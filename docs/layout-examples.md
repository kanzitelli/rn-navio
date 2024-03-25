# Navio layouts

Below you will find some options of different app layouts and most used approaches which can be achieved with Navio in easy way and without any boilerplate code.

In the examples, we suppose that we already have our screen components ready under the `@app/screens` folder.

## Content

- [Stacks](#stacks)
  - [App with 2 screens](#app-with-2-screens)
- [Tabs](#tabs)
  - [App with 3 tabs](#app-with-3-tabs)
  - [Tab-based app with drawer](#tab-based-app-with-drawer)
  - [Hide tabs](#hide-tabs)
- [Drawer](#drawer)
  - [Drawer app and 3 pages](#drawer-app-and-3-pages)
  - [Drawer app and tabs inside of one page](#drawer-app-and-tabs-inside-of-one-page)
  - [Drawer with custom content](#drawer-with-custom-content)
- [Auth flow](#drawer)
  - [Static](#static)
  - [Dynamic](#dynamic)

## Stacks

### App with 2 screens

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, Profile} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Profile},
  stacks: {
    HomeStack: ['Home', 'Profile'],
  },
  root: 'stacks.HomeStack',
});

export default () => <navio.App />;

// Now you can push Profile screen from Home screen
navio.push('Profile');
```

## Tabs

### App with 3 tabs

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, Discover, Settings, Profile} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Discover, Settings, Profile},
  stacks: {
    HomeStack: ['Home'],
    DiscoverStack: ['Discover'],
    SettingsStack: ['Settings', 'Profile'],
  },
  tabs: {
    AppTabs: {
      layout: {
        HomeTab: {
          stack: 'HomeStack',
          options: () => ({
            title: 'Home',
          }),
        },
        DiscoverTab: {
          stack: 'DiscoverStack',
          options: () => ({
            title: 'Discover',
          }),
        },
        SettingsTab: {
          stack: 'SettingsStack',
          options: () => ({
            title: 'Settings',
          }),
        },
      },
    },
  },
  root: 'tabs.AppTabs',
});

export default () => <navio.App />;
```

### Tab-based app with drawer

Builds an app with 2 tabs and a drawer inside one of the tab. It can be used for showing product categories or similar cases.

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, Discover, Settings, Profile} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Settings},
  stacks: {
    HomeStack: ['Home'],
  },
  tabs: {
    AppTabs: {
      layout: {
        HomeTab: {
          stack: HomeStack,
        },
        SettingsTab: {
          drawer: 'SettingsDrawer',
        },
      },
    },
  },
  drawers: {
    SettingsDrawer: {
      layout: {
        SettingsPage: {
          stack: ['Settings'],
          options: {
            title: 'Settings',
            drawerPosition: 'right',
          },
        },
        ProfilePage: {
          stack: ['Profile'],
          options: {
            title: 'Profile',
            drawerPosition: 'right',
          },
        },
      },
    },
  },
  root: 'tabs.AppTabs',
});

export default () => <navio.App />;
```

### Hide tabs

Hide tabs on a specific screen.

As React Navigation suggests in the [docs](https://reactnavigation.org/docs/hiding-tabbar-in-screens/), we need to define a stack that we want to "push over" tabs.

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, Product, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {
    Home,
    Settings,

    ProductPage: {
      component: Product,
      options: {
        headerShown: false,
      },
    },
  },
  stacks: {
    ProductPageStack: {
      screens: ['ProductPage'],
      containerOptions: {
        headerShown: true,
        title: 'Product page',
      },
    },
  },
  tabs: {
    AppTabs: {
      layout: {
        Home: ['Home'],
        Settings: ['Settings'],
      },
    },
  },
  root: 'tabs.AppTabs',
});

// Now you can push `ProductPageStack` from tabs and it will be without tabs.
navio.stacks.push('ProductPageStack');
```

## Drawer

### Drawer app and 3 pages

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, Discover, Settings, Profile} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Discover, Settings, Profile},
  stacks: {
    HomeStack: ['Home'],
    SettingsStack: ['Settings', 'Profile'],
  },
  drawers: {
    AppDrawer: {
      layout: {
        MainPage: 'HomeStack',
        DiscoverPage: ['Discover'],
        SettingsPage: {stack: 'SettingsStack'},
      },
    },
  },
  root: 'drawers.AppDrawer',
});

export default () => <navio.App />;
```

### Drawer app and tabs inside of one page

Builds an app with main drawer and tabs inside one of the drawer pages. It can be used to build Twitter app alike layout.

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, ProductMain, ProductReviews, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, ProductMain, ProductReviews, Settings},
  tabs: {
    ProductTabs: {
      layout: {
        MainTab: {
          stack: ['ProductMain'],
        },
        ReviewsTab: {
          stack: ['ProductReviews'],
        },
      },
    },
  },
  drawers: {
    AppDrawer: {
      layout: {
        MainPage: {
          stack: ['Home'],
        },
        ProductPage: {
          tabs: 'ProductTabs',
        },
        SettingsPage: ['Settings'],
      },
    },
  },
  root: 'drawers.AppDrawer',
});

export default () => <navio.App />;
```

### Drawer with custom content

Builds an app with main drawer and custom content.

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Home, Settings} from '@app/screens';

const navio = Navio.build({
  screens: {Home, Settings},
  drawers: {
    AppDrawer: {
      content: {
        HomePage: {
          stack: ['Home'],
        },
        SettingsPage: {
          stack: ['Settings'],
        },
      },

      navigatorProps: {
        drawerContent: (props: any) => (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />

            <View style={{height: 1, backgroundColor: 'black'}} />
            <DrawerItem label="Close drawer" onPress={() => navio.drawers.close()} />
          </DrawerContentScrollView>
        ),
      },
    },
  },
  root: 'drawers.AppDrawer',
});

export default () => <navio.App />;
```

## Auth flow

There are two ways of handling `Auth` flow with Navio: Static and Dynamic.

### Static

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Main, SignIn, SignUp} from '@app/screens';

const navio = Navio.build({
  screens: {Main, SignIn, SignUp},
  stacks: {
    MainApp: ['Main'],
    Auth: ['SignIn', 'SignUp'],
  },
  root: 'stacks.MainApp',
});

// Let's say you show `MainApp` in the beginning with limited functionality
// and have some screen with "Sign in" button. After pressing "Sign in",
// you can show `Auth` flow.
const Main = () => {
  const {navio} = useServices();

  const onSignInPressed = () => {
    navio.setRoot('stacks', 'Auth');
  };

  return <>{Content}</>;
};

// After `Auth` flow is successfully finished, you can show `MainApp`.
navio.setRoot('stacks', 'MainApp');

export default () => <navio.App />;
```

### Dynamic

```tsx
// App.tsx
import {Navio} from 'rn-navio';
import {Main, SignIn, SignUp} from '@app/screens';

const navio = Navio.build({
  screens: {Main, SignIn, SignUp},
  stacks: {
    MainApp: ['Main'],
    Auth: ['SignIn', 'SignUp'],
  },
  root: 'stacks.MainApp',
});

// Let's say you want to react on changes from auth provider (stores, hook, etc.)
// and show root app depending on that value.
export default (): JSX.Element => {
  const {authData} = useAuth();
  const isLoggedIn = !!authData;

  return (
    <SomeProviders>
      <navio.App initialRouteName={isLoggedIn ? 'MainApp' : 'Auth'} />
    </SomeProviders>
  );
};
```
