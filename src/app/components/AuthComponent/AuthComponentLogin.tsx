"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import classes from "./AuthComponentLogin.module.css";
import { account } from "@/lib/appwrite";

export function AuthComponentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await account.createEmailPasswordSession(email, password);
      alert("Login Successful!");
      router.push("/dashboard"); // Redirect to dashboard after login
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Welcome to EcoChef
        </Title>
        <Text fw={700} size="xl" ta="center">
          Login
        </Text>

        {error && (
          <Text color="red" size="sm" ta="center" mb="sm">
            {error}
          </Text>
        )}

        <TextInput
          label="Email address"
          placeholder="hello@gmail.com"
          size="md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          mt="md"
          size="md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button fullWidth mt="xl" size="md" onClick={handleLogin}>
          Login
        </Button>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{" "}
          <Anchor<"a">
            href="#"
            fw={700}
            onClick={() => router.push("/auth?mode=signup")}
          >
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}
