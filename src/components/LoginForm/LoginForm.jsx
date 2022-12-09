import React from "react";
import { useHistory } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../../shared/components/Form-Elements/Button";
import Input from "../../shared/components/Form-Elements/Input";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/utils/validators";
import { LoginInitials } from "../../shared/utils/form initial data/LoginInitials";
import { useForm } from "../../hooks/form-hook";

const LoginForm = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const history = useHistory();

  const { formState, inputHandler } = useForm(LoginInitials);
  const loginHandler = (e) => {
    e.preventDefault();
    console.log(formState.inputs);
    setUser({
      name: formState.inputs.email.value,
      role: "admin",
      authenticated: true,
      _id: "639188f900d7598eb06881b6",
    });
    history.replace("/");
  };
  return (
    <form onSubmit={loginHandler}>
      <div>
        <div>
          <Input
            id="email"
            type="email"
            label="Email"
            errorText="This field is required"
            onInputChange={inputHandler}
            validators={[VALIDATOR_EMAIL()]}
          />
        </div>
        <div>
          <Input
            id="password"
            type="password"
            label="Password"
            errorText="This field is required"
            onInputChange={inputHandler}
            validators={[VALIDATOR_MINLENGTH(6)]}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <Button large warning disabled={!formState.isValid} type="submit">
          Login
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
