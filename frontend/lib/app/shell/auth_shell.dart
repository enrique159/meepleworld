import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:meepleworld/core/ui/styles/app_colors.dart';
import 'package:meepleworld/features/auth/presentation/widgets/auth_branding.dart';

class AuthShell extends StatelessWidget {
  const AuthShell({
    required this.child,
    this.alignContentToBottom = false,
    super.key,
  });

  final Widget child;
  final bool alignContentToBottom;

  @override
  Widget build(BuildContext context) {
    final base = ThemeData.light();
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemStatusBarContrastEnforced: false,
        systemNavigationBarColor: Colors.transparent,
        systemNavigationBarIconBrightness: Brightness.light,
        systemNavigationBarContrastEnforced: false,
      ),
      child: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFEA90BB), Color(0xFF9090EA)],
            stops: [0, 1],
          ),
        ),
        child: SizedBox.expand(
          child: Theme(
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
                    const padding = EdgeInsets.fromLTRB(24, 64, 24, 24);
                    final Widget content;

                    if (alignContentToBottom) {
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
      ),
    );
  }
}
