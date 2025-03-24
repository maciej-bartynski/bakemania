enum CommonViews {
    SplashScreen = '/',
    AuthScreen = '/auth',
}

enum UserViews {
    DashboardScreen = '/dashboard',
    GiftCardScreen = '/dashboard/gift-card',
    StampsCardScreen = '/dashboard/stamps-card',
    SettingsScreen = '/settings',
    HistoryScreen = '/history',
}

enum ManagerViews {
    AssistantScreen = '/assistant',
    SettingsScreen = '/settings',
    UsersScreen = '/users',
    UserDetailScreen = '/user/:id',
}

const ViewsLibrary = {
    CommonViews,
    UserViews,
    ManagerViews,
}

export type {
    CommonViews,
    UserViews,
    ManagerViews,
}

export default ViewsLibrary;