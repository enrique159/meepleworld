import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';
import 'package:meepleworld/features/auth/presentation/widgets/auth_branding.dart';

import 'widgets/main_background.dart';

class AuthShell extends StatelessWidget {
  const AuthShell({
    required this.child,
    this.alignContentToBottom = false,
    this.formLayout = false,
    super.key,
  });

  final Widget child;
  final bool alignContentToBottom;
  final bool formLayout;

  @override
  Widget build(BuildContext context) {
    final base = ThemeData.light();
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: formLayout
            ? Brightness.dark
            : Brightness.light,
        statusBarBrightness: formLayout ? Brightness.light : Brightness.dark,
        systemStatusBarContrastEnforced: false,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: formLayout
            ? Brightness.dark
            : Brightness.light,
        systemNavigationBarContrastEnforced: false,
      ),
      child: _background(
        Theme(
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
            backgroundColor: Colors.transparent,
            body: SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final padding = formLayout
                      ? const EdgeInsets.fromLTRB(34, 16, 34, 24)
                      : const EdgeInsets.fromLTRB(24, 64, 24, 24);
                  final Widget content;

                  if (formLayout) {
                    final minHeight = constraints.maxHeight > padding.vertical
                        ? constraints.maxHeight - padding.vertical
                        : 0.0;
                    content = ConstrainedBox(
                      constraints: BoxConstraints(minHeight: minHeight),
                      child: IntrinsicHeight(child: child),
                    );
                  } else if (alignContentToBottom) {
                    final minHeight = constraints.maxHeight > padding.vertical
                        ? constraints.maxHeight - padding.vertical
                        : 0.0;
                    content = ConstrainedBox(
                      constraints: BoxConstraints(minHeight: minHeight),
                      child: IntrinsicHeight(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const AuthBranding(),
                            const SizedBox(height: 56),
                            Expanded(
                              child: Align(
                                alignment: Alignment.bottomCenter,
                                child: child,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  } else {
                    content = Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const AuthBranding(),
                        const SizedBox(height: 56),
                        child,
                      ],
                    );
                  }

                  return SingleChildScrollView(
                    padding: padding,
                    child: Align(
                      alignment: Alignment.topCenter,
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 480),
                        child: content,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _background(Widget content) => formLayout
      ? MainBackground(child: content)
      : DecoratedBox(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFFEA90BB), Color(0xFF9090EA)],
              stops: [0, 1],
            ),
          ),
          child: SizedBox.expand(child: content),
        );
}
