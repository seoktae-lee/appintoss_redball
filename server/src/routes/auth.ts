import { Router, Request, Response } from "express";
import { signToken, authMiddleware, AuthRequest } from "../middleware/auth";
import { findUserByAnonymousKey, createUser, deleteUser, deleteUserPrediction, setUserTeam } from "../db";
import { TEAMS } from "../data/worldcup2026";

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
    res.json({ token, user: { id: user.id, nickname: user.nickname, myTeam: user.myTeam } });
  } catch (error) {
    console.error("[AUTH]", error);
    res.status(500).json({ error: "로그인 중 오류가 발생했어요." });
  }
});

router.patch("/me", authMiddleware, (req: AuthRequest, res: Response): void => {
  const { myTeam } = req.body as { myTeam?: string };
  if (!myTeam || !TEAMS[myTeam]) {
    res.status(400).json({ error: "올바른 팀 코드가 필요해요." });
    return;
  }
  const user = setUserTeam(req.userId!, myTeam);
  if (!user) { res.status(404).json({ error: "유저를 찾을 수 없어요." }); return; }
  res.json({ ok: true, myTeam: user.myTeam });
});

router.delete("/me", authMiddleware, (req: AuthRequest, res: Response): void => {
  deleteUser(req.userId!);
  deleteUserPrediction(req.userId!);
  res.json({ ok: true });
});

router.post("/unlink", (req: Request, res: Response): void => {
  const { userKey } = req.body as { userKey?: string };
  if (userKey) {
    const user = findUserByAnonymousKey(userKey);
    if (user) {
      deleteUser(user.id);
      deleteUserPrediction(user.id);
    }
    console.log(`[Unlink] userKey=${userKey}`);
  }
  res.json({ ok: true });
});

export default router;
