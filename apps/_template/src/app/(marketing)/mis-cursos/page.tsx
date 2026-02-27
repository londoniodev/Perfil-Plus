"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button, PageHeader, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from "@alvarosky/ui"
import { BookOpen, PlayCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function MisCursosPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/mis-cursos')
            return
        }

        if (user) {
            fetchPurchasedCourses()
        }
    }, [user, authLoading, router])

    const fetchPurchasedCourses = async () => {
        try {
            const token = localStorage.getItem('token')
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

            const res = await fetch(`${apiUrl}/lms/my-purchased-courses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!res.ok) throw new Error("Error fetching courses")

            const data = await res.json()
            setCourses(data)
        } catch (error) {
            console.error("Failed to load courses", error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container py-12 min-h-[80vh]">
            <PageHeader
                title="Mis Cursos"
                description="Aquí encontrarás todos los programas de formación a los que tienes acceso."
            />

            {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed rounded-lg mt-8">
                    <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-xl font-semibold mb-2">Aún no tienes cursos</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                        Explora nuestra tienda y descubre programas que impulsarán tu carrera.
                    </p>
                    <Button asChild>
                        <Link href="/tienda">Explorar Catálogo</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {courses.map((course) => (
                        <Card key={course.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                            {course.coverImage && (
                                <div className="h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                                    <img
                                        src={course.coverImage}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                        {course.theme?.title || "Programa de Formación"}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {course.description}
                                </p>
                            </CardContent>
                            <CardFooter>
                                {/* Por ahora redirigimos al fallback visual de /formacion o donde el ecosistema del LMS consuma los videos */}
                                <Button asChild className="w-full">
                                    <Link href={`/formacion`}>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Continuar Aprendiendo
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
