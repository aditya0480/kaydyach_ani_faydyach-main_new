# WhatsApp Production Debugging Guide (Vercel)

## Issue: WhatsApp works locally but not in production

### Quick Diagnosis Steps:

1. **Test Endpoint**
   - Deploy latest code
   - Visit: https://your-domain.vercel.app/api/test-whatsapp
   - Should return: `{ "success": true, "hasInteraktKey": true }`

2. **Check Vercel Environment Variables**

   ```
   Project → Settings → Environment Variables

   Required:
   - INTERAKT_API_KEY = Y0RjajFBSVl1aXZNTjloRDNrdm9lMHBhVEVndko2VjhGX0wxaHB4dEVfMDo=
   - RAZORPAY_WEBHOOK_SECRET = 7i7Wc8W_7rZxT28

   ⚠️ After adding/changing env vars: REDEPLOY!
   ```

3. **Check Vercel Logs**

   ```
   Deployments → Latest → Functions → /api/webhooks/razorpay

   Look for:
   ✅ [WHATSAPP] Sending template "rti_book_v1" to 919284217216
   ✅ [WHATSAPP] Message sent to 919284217216 { result: true, ... }
   ❌ [WHATSAPP] Error sending message: ...
   ```

4. **Verify S3 Files are Public**

   ```
   Test in incognito browser:
   https://kaydyach-ani-faydyach.s3.ap-south-1.amazonaws.com/RTI%20...pdf

   Should: Download PDF immediately
   Should NOT: Show "Access Denied"
   ```

5. **Check Razorpay Webhook**

   ```
   Razorpay Dashboard → Settings → Webhooks

   URL: https://your-domain.vercel.app/api/webhooks/razorpay
   Secret: 7i7Wc8W_7rZxT28
   Active Events: ✅ payment.captured
   Status: ✅ Active
   ```

6. **Verify Interakt Templates**

   ```
   Interakt Dashboard → Templates

   ✅ rti_book_v1 - Status: APPROVED
   ✅ malmatta_book_v1 - Status: APPROVED
   ✅ vivah_book_v1 - Status: APPROVED
   ✅ payment_success_pdf_v1 - Status: APPROVED

   ⚠️ Templates must be APPROVED by WhatsApp to work in production
   ```

### Common Issues & Solutions:

| Issue                       | How to Identify                             | Solution                                       |
| --------------------------- | ------------------------------------------- | ---------------------------------------------- |
| **Missing Env Var**         | Test endpoint shows `hasInteraktKey: false` | Add `INTERAKT_API_KEY` in Vercel → Redeploy    |
| **Env Var Not Applied**     | Added env var but still not working         | Redeploy WITHOUT build cache                   |
| **S3 Not Public**           | PDF URL shows "Access Denied"               | AWS S3 → Make objects public                   |
| **Template Not Approved**   | Logs show "queued" but never delivered      | Wait for WhatsApp approval                     |
| **Wrong Webhook URL**       | No logs in Vercel when payment succeeds     | Update Razorpay webhook to production URL      |
| **Webhook Secret Mismatch** | Webhook returns 401                         | Match `RAZORPAY_WEBHOOK_SECRET` in both places |

### Debugging Commands:

```bash
# 1. Deploy latest code
git add .
git commit -m "debug: add whatsapp test endpoint"
git push origin main

# 2. Wait for Vercel deployment (check dashboard)

# 3. Test diagnostic endpoint
curl https://your-domain.vercel.app/api/test-whatsapp

# 4. Check if you received WhatsApp message

# 5. View Vercel logs
vercel logs --follow
```

### Still Not Working?

Check these in order:

1. ✅ Test endpoint returns `{ "success": true, "hasInteraktKey": true }`
2. ✅ Received WhatsApp from test endpoint
3. ✅ S3 URLs download PDF in incognito browser
4. ✅ Razorpay webhook URL points to production
5. ✅ All templates are APPROVED in Interakt
6. ✅ Redeployed after adding environment variables

If all above are ✅ and still not working:

- Check Vercel function logs for errors
- Check Interakt dashboard for failed messages
- Check Razorpay webhook logs for delivery status
