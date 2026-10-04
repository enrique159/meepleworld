import 'package:flutter/widgets.dart';
import 'package:meepleworld/core/ui/widgets/section_placeholder.dart';

import '../widgets/home_header.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(24, 16, 24, 0),
          child: HomeHeader(),
        ),
        Expanded(child: SectionPlaceholder(title: 'Inicio')),
      ],
    );
  }
}
