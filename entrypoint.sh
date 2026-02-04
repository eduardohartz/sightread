#!/bin/sh
set -e

bun prisma db push

exec bun start