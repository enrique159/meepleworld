import 'package:go_router/go_router.dart';
import 'package:meepleworld/features/home/presentation/screens/home_screen.dart';
import 'package:meepleworld/features/marketplace/presentation/screens/marketplace_screen.dart';
import 'package:meepleworld/features/messages/presentation/screens/messages_screen.dart';
import 'package:meepleworld/features/profile/presentation/screens/profile_screen.dart';
import 'package:meepleworld/features/tables/presentation/screens/tables_screen.dart';

import '../shell/main_shell.dart';
import '../shell/navigation/main_section.dart';
import 'app_routes.dart';

GoRouter createAppRouter() {
  return GoRouter(
    initialLocation: AppRoutes.home,
    routes: [
      // Vistas provisionales. La sesión y el layout de acceso están pendientes.
      ShellRoute(
        pageBuilder: (context, state, child) => NoTransitionPage<void>(
          key: state.pageKey,
          child: MainShell(
            selectedSection: MainSection.fromPath(state.uri.path),
            onSectionSelected: (section) => context.go(section.path),
            child: child,
          ),
        ),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: AppRoutes.homeName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const HomeScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.tables,
            name: AppRoutes.tablesName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const TablesScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.marketplace,
            name: AppRoutes.marketplaceName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const MarketplaceScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.messages,
            name: AppRoutes.messagesName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const MessagesScreen(),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: AppRoutes.profileName,
            pageBuilder: (context, state) => NoTransitionPage<void>(
              key: state.pageKey,
              child: const ProfileScreen(),
            ),
          ),
        ],
      ),
    ],
  );
}
