import { PrismaClient, Subject, FlashcardCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  physics2023Questions,
  mathematics2023Questions,
} from '../lib/practice-test-questions';

const prisma = new PrismaClient();

async function main() {
  // Create a teacher account
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@max.ai' },
    update: {},
    create: {
      name: 'Teacher',
      email: 'teacher@max.ai',
      passwordHash: teacherPassword,
      role: 'TEACHER',
    },
  })

  console.log('Created teacher:', teacher.email)

  // Create sample Physics lessons
  const physicsLessons = [
    {
      title: 'Introduction to Mechanics',
      subject: Subject.PHYSICS,
      content: `# Introduction to Mechanics

Mechanics is the branch of physics that deals with the motion of objects and the forces that cause this motion. It is divided into two main branches:

## Kinematics
Kinematics describes motion without considering the forces that cause it. Key concepts include:
- **Displacement**: The change in position of an object
- **Velocity**: The rate of change of displacement
- **Acceleration**: The rate of change of velocity

The basic equations of motion are:
- v = u + at
- s = ut + ½at²
- v² = u² + 2as

Where:
- v = final velocity
- u = initial velocity
- a = acceleration
- t = time
- s = displacement

## Dynamics
Dynamics deals with the forces that cause motion. Newton's laws of motion are fundamental:
1. **First Law**: An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.
2. **Second Law**: F = ma (Force equals mass times acceleration)
3. **Third Law**: For every action, there is an equal and opposite reaction.`,
      examples: [
        {
          question: 'A car accelerates from rest to 60 km/h in 10 seconds. What is its acceleration?',
          solution: `Given:
- Initial velocity (u) = 0 km/h = 0 m/s
- Final velocity (v) = 60 km/h = 60 × (1000/3600) = 16.67 m/s
- Time (t) = 10 s

Using v = u + at:
16.67 = 0 + a × 10
a = 16.67 / 10 = 1.67 m/s²

The acceleration is 1.67 m/s².`,
        },
        {
          question: 'A ball is thrown upward with an initial velocity of 20 m/s. How high does it go?',
          solution: `Given:
- Initial velocity (u) = 20 m/s
- Final velocity at highest point (v) = 0 m/s
- Acceleration (a) = -9.8 m/s² (gravity)

Using v² = u² + 2as:
0² = 20² + 2(-9.8)s
0 = 400 - 19.6s
s = 400 / 19.6 = 20.41 m

The ball reaches a height of 20.41 meters.`,
        },
      ],
      order: 1,
      createdBy: teacher.id,
    },
    {
      title: 'Work, Energy, and Power',
      subject: Subject.PHYSICS,
      content: `# Work, Energy, and Power

## Work
Work is done when a force causes displacement. The work done by a constant force is:
**W = F × d × cos(θ)**

Where:
- W = work (Joules)
- F = force (Newtons)
- d = displacement (meters)
- θ = angle between force and displacement

## Energy
Energy is the capacity to do work. There are two main forms:

### Kinetic Energy (KE)
The energy of motion: **KE = ½mv²**

### Potential Energy (PE)
Stored energy. Gravitational potential energy: **PE = mgh**

## Conservation of Energy
In a closed system, total energy is conserved:
**KE₁ + PE₁ = KE₂ + PE₂**

## Power
Power is the rate of doing work: **P = W/t = Fv**

Where P is power in Watts (Joules per second).`,
      examples: [
        {
          question: 'A 2 kg object falls from a height of 10 m. What is its velocity just before hitting the ground?',
          solution: `Using conservation of energy:
Initial PE = mgh = 2 × 9.8 × 10 = 196 J
Final KE = ½mv²

Since PE is converted to KE:
196 = ½ × 2 × v²
196 = v²
v = √196 = 14 m/s

The velocity is 14 m/s.`,
        },
      ],
      order: 2,
      createdBy: teacher.id,
    },
    {
      title: 'Electricity and Magnetism',
      subject: Subject.PHYSICS,
      content: `# Electricity and Magnetism

## Electric Charge
- Like charges repel, unlike charges attract
- Charge is quantized: q = ne (where n is an integer, e = 1.6 × 10⁻¹⁹ C)

## Electric Field
The electric field E at a point is the force per unit charge:
**E = F/q**

For a point charge: **E = kq/r²**

## Electric Potential
Electric potential V is the potential energy per unit charge:
**V = U/q**

## Current and Resistance
- **Current**: I = Q/t (charge per unit time)
- **Resistance**: R = V/I (Ohm's Law)
- **Power**: P = IV = I²R = V²/R

## Magnetism
- Moving charges create magnetic fields
- Magnetic force on a moving charge: **F = qvB sin(θ)**
- Right-hand rule determines direction`,
      examples: [
        {
          question: 'A 12V battery is connected to a 4Ω resistor. What is the current?',
          solution: `Using Ohm's Law: V = IR
12 = I × 4
I = 12 / 4 = 3 A

The current is 3 Amperes.`,
        },
      ],
      order: 3,
      createdBy: teacher.id,
    },
  ]

  // Create sample Mathematics lessons
  const mathLessons = [
    {
      title: 'Algebra Fundamentals',
      subject: Subject.MATHEMATICS,
      content: `# Algebra Fundamentals

## Linear Equations
A linear equation in one variable has the form: **ax + b = 0**

To solve:
1. Isolate the variable term
2. Divide by the coefficient

Example: 3x + 5 = 14
3x = 14 - 5 = 9
x = 9/3 = 3

## Quadratic Equations
A quadratic equation has the form: **ax² + bx + c = 0**

### Factoring Method
Factor the quadratic expression and set each factor to zero.

### Quadratic Formula
**x = (-b ± √(b² - 4ac)) / 2a**

The discriminant (b² - 4ac) determines the nature of roots:
- If discriminant > 0: two distinct real roots
- If discriminant = 0: one repeated real root
- If discriminant < 0: two complex roots

## Systems of Equations
Two methods:
1. **Substitution**: Solve one equation for a variable, substitute into the other
2. **Elimination**: Add/subtract equations to eliminate a variable`,
      examples: [
        {
          question: 'Solve: x² - 5x + 6 = 0',
          solution: `Using factoring:
x² - 5x + 6 = (x - 2)(x - 3) = 0

Therefore:
x - 2 = 0 → x = 2
x - 3 = 0 → x = 3

The solutions are x = 2 and x = 3.`,
        },
        {
          question: 'Solve using quadratic formula: 2x² - 7x + 3 = 0',
          solution: `a = 2, b = -7, c = 3

x = (-(-7) ± √((-7)² - 4(2)(3))) / (2 × 2)
x = (7 ± √(49 - 24)) / 4
x = (7 ± √25) / 4
x = (7 ± 5) / 4

x₁ = (7 + 5) / 4 = 12/4 = 3
x₂ = (7 - 5) / 4 = 2/4 = 0.5

The solutions are x = 3 and x = 0.5.`,
        },
      ],
      order: 1,
      createdBy: teacher.id,
    },
    {
      title: 'Trigonometry',
      subject: Subject.MATHEMATICS,
      content: `# Trigonometry

## Basic Trigonometric Ratios
For a right triangle with angle θ:
- **sin(θ) = opposite/hypotenuse**
- **cos(θ) = adjacent/hypotenuse**
- **tan(θ) = opposite/adjacent**

## Pythagorean Identity
**sin²(θ) + cos²(θ) = 1**

## Special Angles
- sin(0°) = 0, cos(0°) = 1
- sin(30°) = 1/2, cos(30°) = √3/2
- sin(45°) = √2/2, cos(45°) = √2/2
- sin(60°) = √3/2, cos(60°) = 1/2
- sin(90°) = 1, cos(90°) = 0

## Law of Sines
For any triangle: **a/sin(A) = b/sin(B) = c/sin(C)**

## Law of Cosines
**c² = a² + b² - 2ab cos(C)**`,
      examples: [
        {
          question: 'In a right triangle, if the opposite side is 3 and the hypotenuse is 5, find sin(θ).',
          solution: `sin(θ) = opposite/hypotenuse = 3/5 = 0.6

Therefore, sin(θ) = 0.6`,
        },
      ],
      order: 2,
      createdBy: teacher.id,
    },
    {
      title: 'Calculus Basics',
      subject: Subject.MATHEMATICS,
      content: `# Calculus Basics

## Limits
The limit of f(x) as x approaches a is the value that f(x) approaches:
**lim(x→a) f(x) = L**

## Derivatives
The derivative represents the rate of change:
**f'(x) = lim(h→0) [f(x+h) - f(x)] / h**

### Basic Rules
- **Power Rule**: d/dx(xⁿ) = nxⁿ⁻¹
- **Constant Rule**: d/dx(c) = 0
- **Sum Rule**: d/dx[f(x) + g(x)] = f'(x) + g'(x)
- **Product Rule**: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)
- **Quotient Rule**: d/dx[f(x)/g(x)] = [f'(x)g(x) - f(x)g'(x)] / [g(x)]²
- **Chain Rule**: d/dx[f(g(x))] = f'(g(x)) × g'(x)

## Integrals
The integral is the antiderivative:
**∫f(x)dx = F(x) + C** where F'(x) = f(x)

### Basic Rules
- **Power Rule**: ∫xⁿdx = xⁿ⁺¹/(n+1) + C (n ≠ -1)
- **Constant Rule**: ∫cdx = cx + C`,
      examples: [
        {
          question: 'Find the derivative of f(x) = 3x² + 5x - 2',
          solution: `Using the power rule and sum rule:
f'(x) = d/dx(3x²) + d/dx(5x) - d/dx(2)
f'(x) = 3 × 2x + 5 × 1 - 0
f'(x) = 6x + 5`,
        },
      ],
      order: 3,
      createdBy: teacher.id,
    },
  ]

  for (const lesson of [...physicsLessons, ...mathLessons]) {
    await prisma.lesson.create({
      data: lesson,
    })
  }

  console.log('Created lessons')

  // Create sample flashcards
  const flashcards = [
    // Physics Theorems
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.THEOREM,
      front: "Newton's First Law",
      back: 'An object at rest stays at rest, and an object in motion stays in motion at constant velocity unless acted upon by an unbalanced force. Also known as the Law of Inertia.',
      order: 1,
    },
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.THEOREM,
      front: "Newton's Second Law",
      back: 'The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma',
      order: 2,
    },
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.THEOREM,
      front: "Newton's Third Law",
      back: 'For every action, there is an equal and opposite reaction. Forces always occur in pairs.',
      order: 3,
    },
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.THEOREM,
      front: 'Law of Conservation of Energy',
      back: 'Energy cannot be created or destroyed, only transformed from one form to another. In a closed system, total energy remains constant.',
      order: 4,
    },
    // Physics Formulas
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.FORMULA,
      front: 'Kinetic Energy',
      back: 'KE = ½mv²\nWhere m is mass and v is velocity',
      order: 5,
    },
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.FORMULA,
      front: 'Potential Energy',
      back: 'PE = mgh\nWhere m is mass, g is gravitational acceleration (9.8 m/s²), and h is height',
      order: 6,
    },
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.FORMULA,
      front: 'Ohm\'s Law',
      back: 'V = IR\nWhere V is voltage, I is current, and R is resistance',
      order: 7,
    },
    {
      subject: Subject.PHYSICS,
      category: FlashcardCategory.FORMULA,
      front: 'Power (Electrical)',
      back: 'P = IV = I²R = V²/R\nWhere P is power, I is current, V is voltage, and R is resistance',
      order: 8,
    },
    // Mathematics Theorems
    {
      subject: Subject.MATHEMATICS,
      category: FlashcardCategory.THEOREM,
      front: 'Pythagorean Theorem',
      back: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²',
      order: 1,
    },
    {
      subject: Subject.MATHEMATICS,
      category: FlashcardCategory.THEOREM,
      front: 'Fundamental Theorem of Calculus',
      back: 'If F is an antiderivative of f, then ∫[a to b] f(x)dx = F(b) - F(a)',
      order: 2,
    },
    // Mathematics Formulas
    {
      subject: Subject.MATHEMATICS,
      category: FlashcardCategory.FORMULA,
      front: 'Quadratic Formula',
      back: 'x = (-b ± √(b² - 4ac)) / 2a\nFor equation ax² + bx + c = 0',
      order: 3,
    },
    {
      subject: Subject.MATHEMATICS,
      category: FlashcardCategory.FORMULA,
      front: 'Derivative of xⁿ',
      back: 'd/dx(xⁿ) = nxⁿ⁻¹\nPower rule for differentiation',
      order: 4,
    },
    {
      subject: Subject.MATHEMATICS,
      category: FlashcardCategory.FORMULA,
      front: 'Integral of xⁿ',
      back: '∫xⁿdx = xⁿ⁺¹/(n+1) + C\nPower rule for integration (n ≠ -1)',
      order: 5,
    },
    {
      subject: Subject.MATHEMATICS,
      category: FlashcardCategory.FORMULA,
      front: 'Area of Circle',
      back: 'A = πr²\nWhere r is the radius',
      order: 6,
    },
  ]

  for (const card of flashcards) {
    await prisma.flashcard.create({
      data: card,
    })
  }

  console.log('Created flashcards')

  // Clear existing tests so we always have exactly our 2 tests with full questions
  await prisma.testAttempt.deleteMany({})
  await prisma.test.deleteMany({})

  // Practice tests: 2023 Physics and Mathematics with full questions (en, kk, ru)
  const practiceTests = [
    {
      subject: Subject.PHYSICS,
      year: 2023,
      pdfUrl: '/tests/fizika_2023.pdf',
      questions: JSON.parse(JSON.stringify(physics2023Questions)),
    },
    {
      subject: Subject.MATHEMATICS,
      year: 2023,
      pdfUrl: '/tests/matematika_2023.pdf',
      questions: JSON.parse(JSON.stringify(mathematics2023Questions)),
    },
  ]

  for (const test of practiceTests) {
    await prisma.test.create({
      data: test,
    })
  }

  console.log('Created practice tests (Physics 2023, Mathematics 2023)')
  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
