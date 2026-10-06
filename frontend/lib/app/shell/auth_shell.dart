import 'package:flutter/material.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';

class AuthShell extends StatelessWidget {
  const AuthShell({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final base = ThemeData.light();
    return Theme(
      data: base.copyWith(
        colorScheme: base.colorScheme.copyWith(
          primary: AppColors.foreground,
          onSurface: AppColors.foreground,
          onSurfaceVariant: AppColors.foreground,
          error: AppColors.foreground,
        ),
        textTheme: base.textTheme.apply(
          bodyColor: AppColors.foreground,
          displayColor: AppColors.foreground,
        ),
        iconTheme: const IconThemeData(color: AppColors.foreground),
        textSelectionTheme: const TextSelectionThemeData(
          cursorColor: AppColors.foreground,
          selectionHandleColor: AppColors.foreground,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Align(
              alignment: Alignment.topCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: child,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
