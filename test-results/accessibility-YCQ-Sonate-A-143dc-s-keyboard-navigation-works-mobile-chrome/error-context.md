# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "YCQ Sonate" [level=1] [ref=e9]
    - heading "Welcome back! Please sign in to continue" [level=6] [ref=e10]
  - generic [ref=e11]:
    - generic [ref=e12]:
      - generic [ref=e13]:
        - text: Email Address
        - generic [ref=e14]: "*"
      - generic [ref=e15]:
        - img [ref=e17]
        - textbox "Email Address" [active] [ref=e19]
        - group:
          - generic: Email Address *
    - generic [ref=e20]:
      - generic [ref=e21]:
        - text: Password
        - generic [ref=e22]: "*"
      - generic [ref=e23]:
        - img [ref=e25]
        - textbox "Password" [ref=e27]
        - button "toggle password visibility" [ref=e29] [cursor=pointer]:
          - img [ref=e30] [cursor=pointer]
        - group:
          - generic: Password *
    - button "Sign In" [ref=e32] [cursor=pointer]:
      - img [ref=e34] [cursor=pointer]
      - text: Sign In
    - generic [ref=e36]:
      - paragraph [ref=e37]: Don't have an account?
      - link "Create Account" [ref=e38] [cursor=pointer]:
        - /url: /register
```