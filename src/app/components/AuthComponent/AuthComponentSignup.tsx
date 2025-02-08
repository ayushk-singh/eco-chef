"use client";

import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "./AuthComponentSignup.module.css";

export function AuthComponentSignup() {
  const router = useRouter();

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome to EcoChef
        </Title>
        <Text fw={700} size="xl" ta="center">
          Signup
        </Text>

        <TextInput label="Name" placeholder="Enter your name" size="md" />
        <TextInput
          label="Email address"
          placeholder="hello@gmail.com"
          size="md"
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
        />
        <Button fullWidth mt="xl" size="md">
          Signup
        </Button>

        <Text ta="center" mt="md">
          Already have an account?{" "}
          <Anchor<"a">
            href="#"
            fw={700}
            onClick={() => router.push("/auth?mode=login")}
          >
            Login
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
