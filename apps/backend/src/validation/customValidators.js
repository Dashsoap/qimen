/**
 * 自定义验证器
 * 用于数据库级别的验证
 */

/**
 * 验证用户名是否可用
 */
export async function isUsernameAvailable(username, prisma) {
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });
  return !existingUser;
}

/**
 * 验证邮箱是否可用
 */
export async function isEmailAvailable(email, prisma) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  return !existingUser;
}

/**
 * 验证手机号是否可用
 */
export async function isPhoneAvailable(phone, prisma) {
  if (!phone) return true;
  const existingUser = await prisma.user.findUnique({
    where: { phone }
  });
  return !existingUser;
}





