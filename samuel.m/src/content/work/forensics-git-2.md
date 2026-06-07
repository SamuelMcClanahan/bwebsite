---
title: "Forensics Git 2 — picoCTF"
date: 2025-03-15
tags: [ctf, forensics, git, picoctf]
category: writeup
excerpt: "Recovering a deleted file from a Git repository embedded in a raw disk image using The Sleuth Kit and Git object plumbing."
---

Let's first break down what this challenge gives us and how the pieces fit together.

## Understanding the challenge

We're handed a compressed disk image (`disk.img.gz`). Inside is a full Linux disk with multiple partitions. Somewhere on that disk is a Git repository, and somewhere in that repository is deleted content we need to recover.

The job naturally splits into two phases:

- **Filesystem phase:** figure out which partition matters and where the repo lives
- **Git phase:** dig through the repository's internal object store to find whatever was deleted

The challenge leans heavily on the fact that Git is content-addressed: deleting a file from the working tree doesn't automatically destroy the underlying objects.

## The problem

The flag is hidden inside a file that was committed and then removed in a subsequent commit. The current checkout won't have it, but the old commit tree and blob should still exist in `.git/objects` — as long as nobody ran `git gc` or otherwise cleaned up the object database.

The real question is whether we can reach those old objects from the filesystem forensics tools alone, without ever mounting the disk or checking out the repo normally.

## Digging deeper

After unpacking the image, `mmls` reveals the partition layout:

```
DOS Partition Table
Offset Sector: 0
Units are in 512-byte sectors

      Slot      Start        End          Length       Description
000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)
001:  -------   0000000000   0000002047   0000002048   Unallocated
002:  000:000   0000002048   0000616447   0000614400   Linux (0x83)
003:  000:001   0000616448   0001140735   0000524288   Linux Swap / Solaris x86 (0x82)
004:  000:002   0001140736   0002097151   0000956416   Linux (0x83)
```

Partition 1 is a boot volume — not interesting. Partition 3 at sector offset `1140736` is the real data partition.

Walking it with recursive `fls` quickly surfaces the repo:

```bash
fls -r -p -o 1140736 disk.img | rg "killer-chat-app|/\.git/|logs/refs/heads/master"
```

```
home/ctf-player/Code/killer-chat-app
home/ctf-player/Code/killer-chat-app/.git
home/ctf-player/Code/killer-chat-app/.git/logs/refs/heads/master
home/ctf-player/Code/killer-chat-app/logs/1.txt
home/ctf-player/Code/killer-chat-app/logs/2.txt
home/ctf-player/Code/killer-chat-app/logs/4.txt
```

Notice: there's a `1.txt`, `2.txt`, and `4.txt` — but no `3.txt` in the working tree. That's our deleted file.

The `.git` directory is intact, so we can read the reflog directly using `icat`:

```bash
icat -o 1140736 disk.img 65710
```

```
0000000000000000000000000000000000000000 2c0a9b2b... commit (initial): Add netcat scripts
2c0a9b2b... 26b809e0... commit: Add video game chat log
26b809e0... 5827632e... commit: Add TV show chat log
5827632e... e80b38b3... commit: Add secret hideout chat log
e80b38b3... 2151ef0c... commit: Remove secret hideout log
2151ef0c... 01533f71... commit: Add random chat log
```

The whole story in one place: a "secret hideout" chat log was added, then explicitly removed. The commit that still contains the file is `e80b38b3...`.

Let's stop here and recollect what we have. Abstracting away the filesystem details:

- We know exactly which commit contains the deleted file
- The `.git/objects` store is readable through `icat`
- We just need to walk commit → tree → subtree → blob to reach the content

From commit `e80b38b3...`, we decode its tree (`ead27e2b...`), find the `logs` subtree (`22f7d0c9...`), and inside it find `3.txt` pointing to blob `7178644433e7cb6da3adf028f1c80d382a18e7b6`.

## The solution

Reading that blob gives us:

```
blob 188
Rex: Meet at the old arcade basement for the secret hideout.
Jay: Ask Rusty at the door and use password picoCTF{g17_r35cu3_16ac6bf3}.
Rex: Bring the decoder map so we can plan the route.
```

Flag: `picoCTF{g17_r35cu3_16ac6bf3}`

The core takeaway is that Git never forgets unless you force it to. Removing a file from the working tree leaves the old commit, tree, and blob objects untouched, and they're trivially recoverable if you can read the `.git` directory.
