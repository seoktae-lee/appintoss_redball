import { Router, Request, Response } from "express";
import { signToken, authMiddleware, AuthRequest } from "../middleware/auth";
import { findUserByAnonymousKey, createUser, deleteUser } from "../db";

const router = Router();

router.post("/login", (req: Request, res: Response): void => {
  const { anonymousKey } = req.body as { anonymousKey: string };

  if (!anonymousKey) {
    res.status(400).json({ error: "anonymousKey가 필요해요." });
    return;
  }

  try {
    let user = findUserByAnonymousKey(anonymousKey);

    if (!user) {
      user = createUser(anonymousKey);
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, nickname: user.nickname } });
  } catch (error) {
    console.error("[AUTH]", error);
    res.status(500).json({ error: "로그인 중 오류가 발생했어요." });
  }
});

router.delete("/me", authMiddleware, (req: AuthRequest, res: Response): void => {
  deleteUser(req.userId!);
  res.json({ ok: true });
});

router.post("/unlink", (req: Request, res: Response): void => {
  res.json({ ok: true });
});

export default router;
