import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:meepleworld/core/network/api_client.dart';
import 'package:meepleworld/core/network/api_config.dart';
import 'package:meepleworld/core/storage/refresh_token_storage.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';
import 'package:meepleworld/features/auth/data/repositories/remote_auth_repository.dart';
import 'package:meepleworld/features/auth/data/services/auth_api_service.dart';
import 'package:meepleworld/features/auth/presentation/view_models/auth_session_view_model.dart';

import 'router/app_router.dart';

class MeepleWorldApp extends StatefulWidget {
  const MeepleWorldApp({super.key});

  @override
  State<MeepleWorldApp> createState() => _MeepleWorldAppState();
}

class _MeepleWorldAppState extends State<MeepleWorldApp>
    with WidgetsBindingObserver {
  late final ApiClient _api;
  late final AuthSessionViewModel _session;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    final config = ApiConfig.fromEnvironment();
    _api = ApiClient(config: config, client: http.Client());
    final auth = RemoteAuthRepository(
      api: AuthApiService(_api),
      storage: RefreshTokenStorage(apiUrl: config.baseUri.toString()),
    );
    _session = AuthSessionViewModel(auth);
    _router = createAppRouter(auth: auth, session: _session);
    WidgetsBinding.instance.addObserver(this);
    unawaited(_session.initialize());
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _session.onResume();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _router.dispose();
    _session.dispose();
    _api.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WidgetsApp.router(
      title: 'MeepleWorld',
      color: const Color(0xFFDFC6FE),
      textStyle: const TextStyle(
        color: AppColors.foreground,
        fontWeight: FontWeight.w400,
      ),
      debugShowCheckedModeBanner: false,
      locale: const Locale('es', 'MX'),
      supportedLocales: const [Locale('es', 'MX')],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      routerConfig: _router,
      builder: (context, child) => IconTheme(
        data: const IconThemeData(color: AppColors.foreground),
        child: child ?? const SizedBox.shrink(),
      ),
    );
  }
}
