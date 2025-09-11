# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "YCQ Sonate" [level=1] [ref=e9]
    - heading "Welcome back! Please sign in to continue" [level=6] [ref=e10]
  - alert [ref=e11]:
    - img [ref=e13]
    - generic [ref=e15]: Invalid credentials
  - generic [ref=e16]:
    - generic [ref=e17]:
      - generic [ref=e18]:
        - text: Email Address
        - generic [ref=e19]: "*"
      - generic [ref=e20]:
        - img [ref=e22]
        - textbox "Email Address" [ref=e24]: demo@symbi-trust.com
        - group:
          - generic: Email Address *
    - generic [ref=e25]:
      - generic [ref=e26]:
        - text: Password
        - generic [ref=e27]: "*"
      - generic [ref=e28]:
        - img [ref=e30]
        - textbox "Password" [ref=e32]: demo123
        - button "toggle password visibility" [ref=e34] [cursor=pointer]:
          - img [ref=e35] [cursor=pointer]
        - group:
          - generic: Password *
    - button "Sign In" [ref=e37] [cursor=pointer]:
      - img [ref=e39] [cursor=pointer]
      - text: Sign In
    - generic [ref=e41]:
      - paragraph [ref=e42]: Don't have an account?
      - link "Create Account" [ref=e43]:
        - /url: /register
```