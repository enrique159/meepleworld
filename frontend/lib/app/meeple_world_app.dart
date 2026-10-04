import 'package:flutter/widgets.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';

import 'router/app_router.dart';

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
      textStyle: const TextStyle(
        color: AppColors.foreground,
        fontWeight: FontWeight.w400,
      ),
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      builder: (context, child) => IconTheme(
        data: const IconThemeData(color: AppColors.foreground),
        child: child ?? const SizedBox.shrink(),
      ),
    );
  }
}
