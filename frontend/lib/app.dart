import 'package:flutter/widgets.dart';

import 'routing/app_router.dart';

class MeepleWorldApp extends StatefulWidget {
  const MeepleWorldApp({super.key});

  @override
  State<MeepleWorldApp> createState() => _MeepleWorldAppState();
}

class _MeepleWorldAppState extends State<MeepleWorldApp> {
  final _router = createAppRouter();

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WidgetsApp.router(
      title: 'MeepleWorld',
      color: const Color(0xFFDFC6FE),
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
    );
  }
}
