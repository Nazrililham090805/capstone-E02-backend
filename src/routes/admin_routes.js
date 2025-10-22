import express from 'express';
const adminRouter = express.Router();

adminRouter.get('/', (req, res) => {
  res.json({ message: 'Admin API running!' });
});

export default adminRouter;
