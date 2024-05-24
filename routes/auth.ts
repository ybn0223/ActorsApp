import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { usersCollection } from '../database';
import {registerUser} from '../database';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

const router = Router();

router.post('/register', async (req, res) =>{
    const {username, password, password2} = req.body;
    const result = await registerUser(username, password, false);
    if (result === "User registered successfully") {
        return res.redirect("/home");
    } else{
        return res.status(400).send(result);
    }
});

router.post('/login', async (req, res) => {
    const {username, password} = req.body;
    let wrongCredentials = true;

    try {
        const user = await usersCollection.findOne({ username });
        if (!user) {
          return res.render('login', { wrongCredentials});
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.render('login', { wrongCredentials});
        }
    
        req.session.user = user;
        return res.redirect("/home");
      } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).send('Server error');
      }
})

router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.redirect('/');
    });
  });

  export default router;