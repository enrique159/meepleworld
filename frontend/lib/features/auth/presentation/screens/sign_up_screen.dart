import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hugeicons/hugeicons.dart';
import 'package:meepleworld/app/router/app_routes.dart';
import 'package:meepleworld/core/ui/widgets/glass_button.dart';
import 'package:meepleworld/core/ui/widgets/glass_text_input.dart';

import '../view_models/sign_up_view_model.dart';
import '../widgets/auth_primary_button.dart';
import '../widgets/auth_validators.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({required this.createViewModel, super.key});

  final SignUpViewModel Function() createViewModel;

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _confirmation = TextEditingController();
  late final SignUpViewModel _viewModel = widget.createViewModel();
  bool _showPassword = false;
  bool _showConfirmation = false;

  void _goBack() {
    if (_viewModel.busy) return;
    FocusScope.of(context).unfocus();
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(AppRoutes.authHome);
    }
  }

  Future<void> _submit() async {
    if (_viewModel.busy || !_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    final result = await _viewModel.submit(
      displayName: _name.text,
      email: _email.text,
      password: _password.text,
    );
    if (!mounted || result == null) return;
    _password.clear();
    _confirmation.clear();
    context.go(AppRoutes.signIn, extra: result);
  }

  @override
  void dispose() {
    _viewModel.dispose();
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _confirmation.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: _viewModel,
    builder: (context, _) => PopScope(
      canPop: !_viewModel.busy,
      child: Form(
        key: _formKey,
        child: AutofillGroup(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: SizedBox.square(
                  dimension: 52,
                  child: GlassButton(
                    semanticLabel: 'Volver',
                    height: 52,
                    padding: EdgeInsets.zero,
                    onPressed: _viewModel.busy ? null : _goBack,
                    child: const HugeIcon(
                      icon: HugeIcons.strokeRoundedArrowLeft01,
                      size: 20,
                      strokeWidth: 1.7,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Semantics(
                header: true,
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10),
                  child: Text(
                    'Crea tu cuenta',
                    style: TextStyle(
                      fontFamily: 'JekoSemiBold',
                      fontSize: 28,
                      height: 1.1,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  'Vamos a comenzar por tus datos de inicio de sesión',
                  style: TextStyle(
                    fontFamily: 'JekoRegular',
                    fontSize: 16,
                    height: 1.2,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Spacer(),
              GlassTextInput(
                controller: _name,
                placeholder: 'Nombre',
                prependIcon: const HugeIcon(
                  icon: HugeIcons.strokeRoundedUser,
                  size: 24,
                  strokeWidth: 1.7,
                ),
                enabled: !_viewModel.busy,
                textCapitalization: TextCapitalization.words,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.name],
                validator: AuthValidators.displayName,
              ),
              const SizedBox(height: 20),
              GlassTextInput(
                controller: _email,
                placeholder: 'Correo electrónico',
                prependIcon: const HugeIcon(
                  icon: HugeIcons.strokeRoundedMail01,
                  size: 24,
                  strokeWidth: 1.7,
                ),
                enabled: !_viewModel.busy,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                autofillHints: const [AutofillHints.email],
                validator: AuthValidators.email,
              ),
              const SizedBox(height: 20),
              GlassTextInput(
                controller: _password,
                placeholder: 'contraseña',
                prependIcon: const HugeIcon(
                  icon: HugeIcons.strokeRoundedLockPassword,
                  size: 24,
                  strokeWidth: 1.7,
                ),
                appendIcon: _visibilityButton(
                  visible: _showPassword,
                  label: 'contraseña',
                  onPressed: () =>
                      setState(() => _showPassword = !_showPassword),
                ),
                enabled: !_viewModel.busy,
                obscureText: !_showPassword,
                autocorrect: false,
                enableSuggestions: false,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.newPassword],
                validator: (value) =>
                    AuthValidators.password(value, registering: true),
              ),
              const SizedBox(height: 20),
              GlassTextInput(
                controller: _confirmation,
                placeholder: 'Repite contraseña',
                prependIcon: const HugeIcon(
                  icon: HugeIcons.strokeRoundedLockPassword,
                  size: 24,
                  strokeWidth: 1.7,
                ),
                appendIcon: _visibilityButton(
                  visible: _showConfirmation,
                  label: 'confirmación de contraseña',
                  onPressed: () =>
                      setState(() => _showConfirmation = !_showConfirmation),
                ),
                enabled: !_viewModel.busy,
                obscureText: !_showConfirmation,
                autocorrect: false,
                enableSuggestions: false,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.newPassword],
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Repite tu contraseña.';
                  }
                  if (value != _password.text) {
                    return 'Las contraseñas no coinciden.';
                  }
                  return null;
                },
                onSubmitted: (_) => _submit(),
              ),
              if (_viewModel.errorMessage case final message?) ...[
                const SizedBox(height: 16),
                Semantics(
                  liveRegion: true,
                  child: Text(
                    message,
                    style: const TextStyle(fontFamily: 'JekoRegular'),
                  ),
                ),
              ],
              const SizedBox(height: 30),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: AuthPrimaryButton(
                  label: _viewModel.busy ? 'Creando cuenta…' : 'Siguiente',
                  onPressed: _viewModel.busy ? null : _submit,
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );

  Widget _visibilityButton({
    required bool visible,
    required String label,
    required VoidCallback onPressed,
  }) => IconButton(
    tooltip: '${visible ? 'Ocultar' : 'Mostrar'} $label',
    onPressed: _viewModel.busy ? null : onPressed,
    icon: HugeIcon(
      icon: visible
          ? HugeIcons.strokeRoundedView
          : HugeIcons.strokeRoundedViewOff,
      size: 24,
      strokeWidth: 1.7,
    ),
  );
}
