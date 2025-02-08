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
  Notification,
} from "@mantine/core";
import classes from "./AuthComponentSignup.module.css";
import { account, ID } from "@/lib/appwrite";

export function AuthComponentSignup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      await account.create(ID.unique(), email, password, name);
      alert('Account Created Successfully')
      router.push("/auth?mode=login"); 
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
          Signup
        </Text>

        {error && <Notification color="red" mt="md">{error}</Notification>}

        <TextInput
          label="Name"
          placeholder="Enter your name"
          size="md"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <Button fullWidth mt="xl" size="md" onClick={handleSignup}>
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
