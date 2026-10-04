import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'navigation/main_section.dart';
import 'widgets/main_background.dart';
import 'widgets/main_bottom_navigation_bar.dart';

class MainShell extends StatelessWidget {
  const MainShell({
    required this.child,
    required this.selectedSection,
    required this.onSectionSelected,
    super.key,
  });

  final Widget child;
  final MainSection selectedSection;
  final ValueChanged<MainSection> onSectionSelected;

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Color(0x00000000),
        statusBarIconBrightness: Brightness.dark,
        statusBarBrightness: Brightness.light,
        systemStatusBarContrastEnforced: false,
        systemNavigationBarColor: Color(0x00000000),
        systemNavigationBarIconBrightness: Brightness.dark,
        systemNavigationBarContrastEnforced: false,
      ),
      child: MainBackground(
        child: SafeArea(
          child: Column(
            children: [
              Expanded(child: child),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
                child: Align(
                  alignment: Alignment.bottomCenter,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 400),
                    child: MainBottomNavigationBar(
                      selectedSection: selectedSection,
                      onSelected: onSectionSelected,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
