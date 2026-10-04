import 'package:flutter/widgets.dart';
import 'package:hugeicons/hugeicons.dart';

import '../components/glass_container.dart';
import 'main_section.dart';

class MainBottomNavigationBar extends StatelessWidget {
  const MainBottomNavigationBar({
    required this.selectedSection,
    required this.onSelected,
    super.key,
  });

  final MainSection selectedSection;
  final ValueChanged<MainSection> onSelected;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // Conservar la proporción de la referencia y áreas táctiles de al menos 48 px.
        final buttonSize =
            ((constraints.maxWidth - 12) / MainSection.values.length).clamp(
              48.0,
              72.0,
            );

        return Semantics(
          container: true,
          explicitChildNodes: true,
          label: 'Navegación principal',
          child: GlassContainer(
            borderRadius: BorderRadius.circular(999),
            padding: const EdgeInsets.all(6),
            child: SizedBox(
              height: buttonSize,
              child: Row(
                children: [
                  for (final section in MainSection.values)
                    Expanded(
                      child: _NavigationButton(
                        section: section,
                        selected: section == selectedSection,
                        size: buttonSize,
                        onTap: () => onSelected(section),
                      ),
                    ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _NavigationButton extends StatelessWidget {
  const _NavigationButton({
    required this.section,
    required this.selected,
    required this.size,
    required this.onTap,
  });

  final MainSection section;
  final bool selected;
  final double size;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: section.label,
      onTap: onTap,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        excludeFromSemantics: true,
        onTap: onTap,
        child: Center(
          child: SizedBox.square(
            dimension: size,
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: selected
                    ? const Color(0xFFFFFFFF)
                    : const Color(0x00000000),
              ),
              child: Center(
                child: HugeIcon(
                  icon: section.icon,
                  size: 28,
                  strokeWidth: 1.7,
                  color: const Color(0xFF1B1B1B),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
