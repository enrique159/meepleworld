import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:meepleworld/app/router/app_routes.dart';

import '../view_models/sign_in_view_model.dart';
import '../widgets/auth_validators.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({
    required this.createViewModel,
    this.initialEmail = '',
    this.message,
    super.key,
  });

  final SignInViewModel Function() createViewModel;
  final String initialEmail;
  final String? message;

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _formKey = GlobalKey<FormState>();
  late final _email = TextEditingController(text: widget.initialEmail);
  final _password = TextEditingController();
  late final SignInViewModel _viewModel = widget.createViewModel();

  Future<void> _submit() async {
    if (_viewModel.busy || !_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    await _viewModel.submit(email: _email.text, password: _password.text);
  }

  @override
  void dispose() {
    _viewModel.dispose();
    _email.dispose();
    _password.dispose();
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
              Semantics(
                header: true,
                child: Text(
                  'Iniciar sesión',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
              if (widget.message case final message?) ...[
                const SizedBox(height: 16),
                Semantics(liveRegion: true, child: Text(message)),
              ],
              const SizedBox(height: 24),
              TextFormField(
                controller: _email,
                enabled: !_viewModel.busy,
                decoration: const InputDecoration(
                  labelText: 'Correo electrónico',
                ),
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autocorrect: false,
                autofillHints: const [AutofillHints.username],
                validator: AuthValidators.email,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _password,
                enabled: !_viewModel.busy,
                decoration: const InputDecoration(labelText: 'Contraseña'),
                obscureText: true,
                autocorrect: false,
                enableSuggestions: false,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                validator: (value) => AuthValidators.password(value),
                onFieldSubmitted: (_) => _submit(),
              ),
              if (_viewModel.errorMessage case final message?) ...[
                const SizedBox(height: 16),
                Semantics(liveRegion: true, child: Text(message)),
              ],
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: _viewModel.busy ? null : _submit,
                child: Text(
                  _viewModel.busy ? 'Iniciando sesión…' : 'Iniciar sesión',
                ),
              ),
              TextButton(
                onPressed: _viewModel.busy
                    ? null
                    : () => context.go(AppRoutes.signUp),
                child: const Text('Crear cuenta'),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}
