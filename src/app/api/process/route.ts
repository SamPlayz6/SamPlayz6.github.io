import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Get the backend directory path
    const backendDir = path.join(process.cwd(), 'backend')

    // Run the Python processing script
    const { stdout, stderr } = await execAsync('python main.py', {
      cwd: backendDir,
      timeout: 120000, // 2 minute timeout
    })

    if (stderr && !stderr.includes('UserWarning')) {
      console.error('Processing stderr:', stderr)
    }

    console.log('Processing output:', stdout)

    return NextResponse.json({
      success: true,
      message: 'Life data processed successfully!',
      output: stdout,
    })
  } catch (error: any) {
    console.error('Processing error:', error)

    // Check if it's a missing API key error
    if (error.message?.includes('ANTHROPIC_API_KEY') || error.message?.includes('API key')) {
      return NextResponse.json({
        success: false,
        error: 'API key not configured. Add your Anthropic API key to .env.local',
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process life data',
    }, { status: 500 })
  }
}
